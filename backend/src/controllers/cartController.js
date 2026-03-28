const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');

const TAX_RATE = 0.05; // 5% GST
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 99;

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart, ...calculateCart(cart) });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to cart
// @route   POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return next(new AppError('Product not found', 404));
    if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existing = cart.items.find(
      i => i.product.toString() === productId && i.size === size && i.color === color
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color, price: product.discountedPrice || product.price });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart, ...calculateCart(cart) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const item = cart.items.id(req.params.itemId);
    if (!item) return next(new AppError('Item not found', 404));

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart, ...calculateCart(cart) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new AppError('Cart not found', 404));
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart, ...calculateCart(cart) });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return next(new AppError('Invalid coupon code', 400));

    const validity = coupon.isValid();
    if (!validity.valid) return next(new AppError(validity.message, 400));

    const userUsed = coupon.usedBy.filter(u => u.toString() === req.user._id.toString()).length;
    if (userUsed >= coupon.userUsageLimit) return next(new AppError('You have already used this coupon', 400));

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return next(new AppError('Cart is empty', 400));

    const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
    if (subtotal < coupon.minOrderAmount) {
      return next(new AppError(`Minimum order amount ₹${coupon.minOrderAmount} required`, 400));
    }

    cart.coupon = coupon._id;
    await cart.save();
    res.json({ success: true, message: 'Coupon applied!', cart, ...calculateCart(cart, coupon) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.coupon = null; await cart.save(); }
    await cart.populate('items.product');
    res.json({ success: true, cart, ...calculateCart(cart) });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

function calculateCart(cart, couponDoc = null) {
  const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
  let discount = 0;

  if (couponDoc) {
    if (couponDoc.discountType === 'percentage') {
      discount = (subtotal * couponDoc.discountValue) / 100;
      if (couponDoc.maxDiscountAmount) discount = Math.min(discount, couponDoc.maxDiscountAmount);
    } else {
      discount = couponDoc.discountValue;
    }
  }

  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * TAX_RATE;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = afterDiscount + tax + shipping;

  return { pricing: { subtotal, discount, tax, shipping, total } };
}
