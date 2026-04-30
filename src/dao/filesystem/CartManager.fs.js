const fs = require('fs/promises');
const path = require('path');

class CartManagerFS {
  constructor(filePath = path.join(__dirname, 'data', 'carts.json')) {
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

  async #writeFile(carts) {
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  async createCart() {
    const carts = await this.#readFile();
    const newCart = {
      id: Date.now().toString(),
      products: []
    };

    carts.push(newCart);
    await this.#writeFile(carts);

    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    return carts.find((cart) => String(cart.id) === String(id));
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.#readFile();
    const cart = carts.find((item) => String(item.id) === String(cartId));

    if (!cart) return null;

    const productInCart = cart.products.find((item) => String(item.product) === String(productId));

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.#writeFile(carts);
    return cart;
  }

  async clearCart(cartId) {
    const carts = await this.#readFile();
    const cart = carts.find((item) => String(item.id) === String(cartId));

    if (!cart) return null;

    cart.products = [];
    await this.#writeFile(carts);

    return cart;
  }
}

module.exports = CartManagerFS;
