const ProductManagerMongo = require('../dao/mongo/ProductManager.mongo');
const buildPaginationLinks = require('../utils/paginationLinks');
const { getSocketServer } = require('../utils/socketServer');

const productManager = new ProductManagerMongo();

const emitProductsUpdate = async () => {
  const io = getSocketServer();
  if (!io) return;

  const result = await productManager.getProducts({ limit: 100, page: 1 });
  io.emit('productsUpdated', result.docs);
};

const getProducts = async (req, res, next) => {
  try {
    const result = await productManager.getProducts(req.query);
    const links = buildPaginationLinks(req, result);

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: links.prevLink,
      nextLink: links.nextLink
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productManager.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    res.json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productManager.createProduct(req.body);
    await emitProductsUpdate();

    res.status(201).json({
      status: 'success',
      message: 'Producto creado correctamente',
      payload: product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productManager.updateProduct(req.params.pid, req.body);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    await emitProductsUpdate();

    res.json({
      status: 'success',
      message: 'Producto actualizado correctamente',
      payload: product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productManager.deleteProduct(req.params.pid);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }

    await emitProductsUpdate();

    res.json({
      status: 'success',
      message: 'Producto eliminado correctamente',
      payload: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
