const CartModel = require("../../models/cart.model");
const ProductModel = require("../../models/product.model");

class CartManagerMongo {
  async createCart() {
    return CartModel.create({ products: [] });
  }

  async getCartById(id) {
    return CartModel.findById(id).populate("products.product").lean();
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const productExists = await ProductModel.exists({ _id: productId });
    if (!productExists) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const quantityToAdd = Number(quantity) > 0 ? Number(quantity) : 1;

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantityToAdd;
    } else {
      cart.products.push({
        product: productId,
        quantity: quantityToAdd,
      });
    }

    await cart.save();

    return this.getCartById(cartId);
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId,
    );
    await cart.save();

    return this.getCartById(cartId);
  }

  async updateCart(cartId, products = []) {
    const normalizedProducts = products.map((item) => ({
      product: item.product || item.productId,
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    }));

    return CartModel.findByIdAndUpdate(
      cartId,
      { products: normalizedProducts },
      { new: true, runValidators: true },
    )
      .populate("products.product")
      .lean();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (productIndex < 0) {
      const error = new Error("El producto no existe en el carrito");
      error.statusCode = 404;
      throw error;
    }

    cart.products[productIndex].quantity = Number(quantity);
    await cart.save();

    return this.getCartById(cartId);
  }

  async clearCart(cartId) {
    return CartModel.findByIdAndUpdate(cartId, { products: [] }, { new: true })
      .populate("products.product")
      .lean();
  }
}

module.exports = CartManagerMongo;
