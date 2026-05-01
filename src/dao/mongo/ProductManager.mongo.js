const ProductModel = require("../../models/product.model");

class ProductManagerMongo {
  async getProducts({
    limit = 10,
    page = 1,
    query,
    sort,
    category,
    available,
  } = {}) {
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const parsedPage = Number(page) > 0 ? Number(page) : 1;

    const filter = this.buildFilter({ query, category, available });
    const sortOptions = this.buildSort(sort);

    const totalDocs = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / parsedLimit);

    const currentPage = totalPages === 0 ? 1 : Math.min(parsedPage, totalPages);

    const skip = totalPages === 0 ? 0 : (currentPage - 1) * parsedLimit;

    const products = await ProductModel.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    return {
      docs: products,
      totalDocs,
      limit: parsedLimit,
      totalPages,
      page: currentPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: totalPages > 0 && currentPage < totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage:
        totalPages > 0 && currentPage < totalPages ? currentPage + 1 : null,
    };
  }

  async getProductById(id) {
    return ProductModel.findById(id).lean();
  }

  async createProduct(productData) {
    return ProductModel.create(productData);
  }

  async updateProduct(id, productData) {
    const dataToUpdate = { ...productData };

    delete dataToUpdate._id;
    delete dataToUpdate.id;

    return ProductModel.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteProduct(id) {
    return ProductModel.findByIdAndDelete(id).lean();
  }

  buildFilter({ query, search, category, available }) {
    const conditions = [];

    if (available !== undefined && available !== "") {
      const normalizedAvailable = String(available).trim().toLowerCase();

      if (
        normalizedAvailable === "true" ||
        normalizedAvailable === "available" ||
        normalizedAvailable === "disponible"
      ) {
        conditions.push({
          status: true,
          stock: { $gt: 0 },
        });
      }

      if (
        normalizedAvailable === "false" ||
        normalizedAvailable === "unavailable" ||
        normalizedAvailable === "no-disponible"
      ) {
        conditions.push({
          $or: [{ status: false }, { stock: { $lte: 0 } }],
        });
      }
    }

    if (category) {
      conditions.push({
        category: String(category).trim(),
      });
    }

    if (search) {
      const searchText = String(search).trim();

      conditions.push({
        $or: [
          { title: { $regex: searchText, $options: "i" } },
          { description: { $regex: searchText, $options: "i" } },
          { code: { $regex: searchText, $options: "i" } },
        ],
      });
    }

    if (query && !search && !category && available === undefined) {
      const normalizedQuery = String(query).trim().toLowerCase();

      if (
        normalizedQuery === "available" ||
        normalizedQuery === "disponible" ||
        normalizedQuery === "true"
      ) {
        conditions.push({
          status: true,
          stock: { $gt: 0 },
        });
      } else if (
        normalizedQuery === "unavailable" ||
        normalizedQuery === "no-disponible" ||
        normalizedQuery === "false"
      ) {
        conditions.push({
          $or: [{ status: false }, { stock: { $lte: 0 } }],
        });
      } else {
        conditions.push({
          category: {
            $regex: String(query).trim(),
            $options: "i",
          },
        });
      }
    }

    return conditions.length > 0 ? { $and: conditions } : {};
  }

  buildSort(sort) {
    if (!sort) return {};

    const normalizedSort = String(sort).trim().toLowerCase();

    if (normalizedSort === "asc" || normalizedSort === "price-asc") {
      return { price: 1 };
    }

    if (normalizedSort === "desc" || normalizedSort === "price-desc") {
      return { price: -1 };
    }

    if (normalizedSort === "title-asc") {
      return { title: 1 };
    }

    if (normalizedSort === "title-desc") {
      return { title: -1 };
    }

    if (normalizedSort === "stock-asc") {
      return { stock: 1 };
    }

    if (normalizedSort === "stock-desc") {
      return { stock: -1 };
    }

    return {};
  }
}

module.exports = ProductManagerMongo;
