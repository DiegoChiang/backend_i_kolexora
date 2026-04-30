const validateProduct = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "El body de la petición está vacío o no fue enviado como JSON",
    });
  }

  const requiredFields = [
    "title",
    "description",
    "code",
    "price",
    "stock",
    "category",
  ];

  const missingFields = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === "",
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "error",
      message: `Faltan campos obligatorios: ${missingFields.join(", ")}`,
    });
  }

  req.body.price = Number(req.body.price);
  req.body.stock = Number(req.body.stock);

  if (Number.isNaN(req.body.price) || req.body.price < 0) {
    return res.status(400).json({
      status: "error",
      message: "El precio debe ser un número mayor o igual a 0",
    });
  }

  if (Number.isNaN(req.body.stock) || req.body.stock < 0) {
    return res.status(400).json({
      status: "error",
      message: "El stock debe ser un número mayor o igual a 0",
    });
  }

  const allowedCategories = ["Funkos", "Nendoroids", "Figuras"];

  if (!allowedCategories.includes(req.body.category)) {
    return res.status(400).json({
      status: "error",
      message: "La categoría debe ser Funkos, Nendoroids o Figuras",
    });
  }

  if (req.body.status !== undefined) {
    req.body.status = req.body.status === true || req.body.status === "true";
  }

  if (!Array.isArray(req.body.thumbnails)) {
    req.body.thumbnails = req.body.thumbnails ? [req.body.thumbnails] : [];
  }

  next();
};

module.exports = validateProduct;
