const ProductManagerMongo = require("../dao/mongo/ProductManager.mongo");
const CartManagerMongo = require("../dao/mongo/CartManager.mongo");

const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

const renderProducts = async (req, res, next) => {
  try {
    const limit = 10;

    const result = await productManager.getProducts({
      ...req.query,
      limit,
    });

    const buildViewLink = (targetPage) => {
      if (!targetPage) return null;

      const params = new URLSearchParams(req.query);
      params.set("page", targetPage);
      params.set("limit", limit);

      return `/products?${params.toString()}`;
    };

    res.render("products", {
      title: "Kolexora | Productos",
      products: result.docs,
      productsCount: result.docs.length,
      totalDocs: result.totalDocs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      prevLink: buildViewLink(result.prevPage),
      nextLink: buildViewLink(result.nextPage),
      limit,
      search: req.query.search || "",
      category: req.query.category || "",
      available: req.query.available || "",
      sort: req.query.sort || "",
    });
  } catch (error) {
    next(error);
  }
};

const renderProductDetail = async (req, res, next) => {
  try {
    const product = await productManager.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).render("notFound", {
        title: "Producto no encontrado",
      });
    }

    res.render("productDetail", {
      title: `Kolexora | ${product.title}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

const renderCart = async (req, res, next) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).render("notFound", {
        title: "Carrito no encontrado",
      });
    }

    res.render("cart", {
      title: "Kolexora | Carrito",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const renderRealTimeProducts = async (req, res, next) => {
  try {
    const result = await productManager.getProducts({ limit: 100, page: 1 });

    res.render("realTimeProducts", {
      title: "Kolexora | Tiempo real",
      products: result.docs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  renderProducts,
  renderProductDetail,
  renderCart,
  renderRealTimeProducts,
};
