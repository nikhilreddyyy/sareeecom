const express = require('express');
const router = express.Router();
const {
  getCart, addToCart, updateCartItem, removeFromCart,
  applyCoupon, removeCoupon, clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

module.exports = router;
