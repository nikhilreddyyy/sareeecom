const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');
const { getDb, increment, arrayUnion } = require('../config/firebase');

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 99;

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await Cart.findByUser(req.user.id);
    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    // Fetch products and validate stock
    const itemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        return { ...item, productDoc: product };
      })
    );

    for (const item of itemsWithProducts) {
      if (!item.productDoc || item.productDoc.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${item.productDoc?.name || 'item'}`, 400));
      }
    }

    const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
    let discount = 0;
    let couponDoc = null;

    if (cart.coupon) {
      couponDoc = await Coupon.findById(cart.coupon);
      if (couponDoc) {
        if (couponDoc.discountType === 'percentage') {
          discount = (subtotal * couponDoc.discountValue) / 100;
          if (couponDoc.maxDiscountAmount) discount = Math.min(discount, couponDoc.maxDiscountAmount);
        } else {
          discount = couponDoc.discountValue;
        }
      }
    }

    const afterDiscount = subtotal - discount;
    const taxPrice = afterDiscount * TAX_RATE;
    const shippingPrice = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalPrice = afterDiscount + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user.id,
      items: itemsWithProducts.map((i) => ({
        product: i.product,
        name: i.productDoc.name,
        image: i.productDoc.images?.[0]?.url || '',
        price: i.price,
        quantity: i.quantity,
        size: i.size || '',
        color: i.color || '',
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      discountAmount: discount,
      coupon: cart.coupon || null,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Decrement stock
    for (const item of itemsWithProducts) {
      const db = getDb();
      await db.collection('products').doc(item.product).update({
        stock: increment(-item.quantity),
        soldCount: increment(item.quantity),
      });
    }

    // Update coupon usage
    if (couponDoc) {
      const db = getDb();
      await db.collection('coupons').doc(cart.coupon).update({
        usedCount: increment(1),
        usedBy: arrayUnion(req.user.id),
      });
    }

    // Clear cart
    await Cart.update(cart.id, { items: [], coupon: null });

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
    const result = await Order.getByUser(req.user.id, { page });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.user !== req.user.id && req.user.role !== 'admin') {
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
    const statusHistory = [
      ...(order.statusHistory || []),
      { status: 'confirmed', timestamp: new Date().toISOString(), note: 'Payment received' },
    ];
    const updated = await Order.update(req.params.id, {
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult: req.body.paymentResult || null,
      orderStatus: 'confirmed',
      statusHistory,
    });
    res.json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all orders
// @route   GET /api/admin/orders
exports.adminGetOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await Order.getAll({ page, status: req.query.status || '' });
    res.json({ success: true, ...result });
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

    const statusHistory = [
      ...(order.statusHistory || []),
      { status, timestamp: new Date().toISOString(), note: note || '' },
    ];
    const updateData = { orderStatus: status, statusHistory };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'delivered') updateData.deliveredAt = new Date().toISOString();

    const updated = await Order.update(req.params.id, updateData);
    res.json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Order.getAnalytics();
    res.json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};
