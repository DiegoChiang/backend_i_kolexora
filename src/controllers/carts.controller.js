const CartManagerMongo = require("../dao/mongo/CartManager.mongo");

const cartManager = new CartManagerMongo();

const createCart = async (req, res, next) => {
  try {
    const cart = await cartManager.createCart();

    res.status(201).json({
      status: "success",
      message: "Carrito creado correctamente",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const getCartById = async (req, res, next) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const addProductToCart = async (req, res, next) => {
  try {
    const quantity = req.body?.quantity ? Number(req.body.quantity) : 1;

    if (Number.isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad debe ser un número mayor a 0",
      });
    }

    const cart = await cartManager.addProductToCart(
      req.params.cid,
      req.params.pid,
      quantity,
    );

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Producto agregado al carrito",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductFromCart = async (req, res, next) => {
  try {
    const cart = await cartManager.deleteProductFromCart(
      req.params.cid,
      req.params.pid,
    );

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Producto eliminado del carrito",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({
        status: "error",
        message: "El body debe tener un arreglo products",
      });
    }

    const cart = await cartManager.updateCart(
      req.params.cid,
      req.body.products,
    );

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Carrito actualizado correctamente",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateProductQuantity = async (req, res, next) => {
  try {
    if (!req.body || req.body.quantity === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Debes enviar la cantidad en el body",
      });
    }

    const quantity = Number(req.body.quantity);

    if (Number.isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad debe ser mayor a 0",
      });
    }

    const cart = await cartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity,
    );

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Cantidad actualizada correctamente",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Carrito vaciado correctamente",
      payload: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
  deleteProductFromCart,
  updateCart,
  updateProductQuantity,
  clearCart,
};
