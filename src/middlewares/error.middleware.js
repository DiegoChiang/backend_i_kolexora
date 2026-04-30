const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  if (error.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'ID inválido'
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Ya existe un registro con ese código o valor único'
    });
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Error interno del servidor'
  });
};

module.exports = errorMiddleware;
