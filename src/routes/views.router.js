const { Router } = require('express');
const {
  renderProducts,
  renderProductDetail,
  renderCart,
  renderRealTimeProducts
} = require('../controllers/views.controller');

const router = Router();

router.get('/', (req, res) => res.redirect('/products'));
router.get('/products', renderProducts);
router.get('/products/:pid', renderProductDetail);
router.get('/carts/:cid', renderCart);
router.get('/realtimeproducts', renderRealTimeProducts);

module.exports = router;
