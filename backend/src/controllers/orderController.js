const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 99;

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    if (!cart || cart.items.length === 0) return next(new AppError('Cart is empty', 400));

    // Validate stock
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${item.product?.name || 'item'}`, 400));
      }
    }

    const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
    let discount = 0;
    if (cart.coupon) {
      const coupon = cart.coupon;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
      } else {
        discount = coupon.discountValue;
      }
    }

    const afterDiscount = subtotal - discount;
    const taxPrice = afterDiscount * TAX_RATE;
    const shippingPrice = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalPrice = afterDiscount + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(i => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images[0]?.url || '',
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      discountAmount: discount,
      coupon: cart.coupon?._id,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    // Update coupon usage
    if (cart.coupon) {
      await Coupon.findByIdAndUpdate(cart.coupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user._id },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').skip(skip).limit(limit);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult;
    order.orderStatus = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received' });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/admin/orders
exports.adminGetOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') order.deliveredAt = Date.now();
    order.statusHistory.push({ status, note });
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        monthlyRevenue,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
