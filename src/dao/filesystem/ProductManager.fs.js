const fs = require('fs/promises');
const path = require('path');

class ProductManagerFS {
  constructor(filePath = path.join(__dirname, 'data', 'products.json')) {
    this.path = filePath;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.#writeFile([]);
        return [];
      }
      throw error;
    }
  }

  async #writeFile(products) {
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  async getProducts() {
    return this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    return products.find((product) => String(product.id) === String(id));
  }

  async createProduct(productData) {
    const products = await this.#readFile();
    const newProduct = {
      id: Date.now().toString(),
      status: true,
      thumbnails: [],
      ...productData
    };

    products.push(newProduct);
    await this.#writeFile(products);

    return newProduct;
  }

  async updateProduct(id, productData) {
    const products = await this.#readFile();
    const index = products.findIndex((product) => String(product.id) === String(id));

    if (index < 0) return null;

    delete productData.id;
    products[index] = { ...products[index], ...productData };
    await this.#writeFile(products);

    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const product = products.find((item) => String(item.id) === String(id));
    const filteredProducts = products.filter((item) => String(item.id) !== String(id));

    await this.#writeFile(filteredProducts);
    return product || null;
  }
}

module.exports = ProductManagerFS;
