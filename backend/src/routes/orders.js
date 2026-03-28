const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, updateOrderToPaid,
  adminGetOrders, updateOrderStatus, getAnalytics
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/pay', protect, updateOrderToPaid);

// Admin routes
router.get('/admin/all', protect, admin, adminGetOrders);
router.get('/admin/analytics', protect, admin, getAnalytics);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
