const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 99;

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findByUser(req.user.id);
    if (!cart) cart = await Cart.createForUser(req.user.id);
    let couponDoc = null;
    if (cart.coupon) couponDoc = await Coupon.findById(cart.coupon);
    res.json({ success: true, cart, ...calculateCart(cart.items, couponDoc) });
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

    let cart = await Cart.findByUser(req.user.id);
    if (!cart) cart = await Cart.createForUser(req.user.id);

    let items = [...(cart.items || [])];
    const existing = items.find(
      (i) => i.product === productId && i.size === size && i.color === color
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: uuidv4(),
        product: productId,
        quantity,
        size: size || '',
        color: color || '',
        price: product.discountedPrice || product.price,
        productName: product.name,
        productImage: product.images?.[0]?.url || '',
      });
    }

    cart = await Cart.update(cart.id, { items });
    res.json({ success: true, cart, ...calculateCart(items) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findByUser(req.user.id);
    if (!cart) return next(new AppError('Cart not found', 404));

    let items = [...(cart.items || [])];
    const idx = items.findIndex((i) => i.id === req.params.itemId);
    if (idx === -1) return next(new AppError('Item not found', 404));

    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...items[idx], quantity };
    }

    cart = await Cart.update(cart.id, { items });
    res.json({ success: true, cart, ...calculateCart(items) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findByUser(req.user.id);
    if (!cart) return next(new AppError('Cart not found', 404));
    const items = (cart.items || []).filter((i) => i.id !== req.params.itemId);
    cart = await Cart.update(cart.id, { items });
    res.json({ success: true, cart, ...calculateCart(items) });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const couponDoc = await Coupon.findByCode(code);
    if (!couponDoc) return next(new AppError('Invalid coupon code', 400));

    const validity = Coupon.isValid(couponDoc);
    if (!validity.valid) return next(new AppError(validity.message, 400));

    const userUsed = (couponDoc.usedBy || []).filter((u) => u === req.user.id).length;
    if (userUsed >= couponDoc.userUsageLimit) {
      return next(new AppError('You have already used this coupon', 400));
    }

    let cart = await Cart.findByUser(req.user.id);
    if (!cart || !cart.items?.length) return next(new AppError('Cart is empty', 400));

    const subtotal = cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
    if (subtotal < couponDoc.minOrderAmount) {
      return next(new AppError(`Minimum order amount ₹${couponDoc.minOrderAmount} required`, 400));
    }

    cart = await Cart.update(cart.id, { coupon: couponDoc.id });
    res.json({ success: true, message: 'Coupon applied!', cart, ...calculateCart(cart.items, couponDoc) });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
exports.removeCoupon = async (req, res, next) => {
  try {
    let cart = await Cart.findByUser(req.user.id);
    if (cart) cart = await Cart.update(cart.id, { coupon: null });
    res.json({ success: true, cart, ...calculateCart(cart?.items || []) });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByUser(req.user.id);
    if (cart) await Cart.update(cart.id, { items: [], coupon: null });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

function calculateCart(items = [], couponDoc = null) {
  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
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
