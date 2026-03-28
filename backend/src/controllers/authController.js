const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return next(new AppError('Email already registered', 400));

    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await User.matchPassword(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }
    if (user.isBlocked) return next(new AppError('Account blocked. Contact support.', 403));

    const token = generateToken(user.id);
    res.json({
      success: true,
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const u = req.user;
  res.json({ success: true, user: { ...u, _id: u.id } });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.update(req.user.id, { name, phone, avatar });
    res.json({ success: true, user: { ...user, _id: user.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!(await User.matchPassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect', 400));
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 12);
    await User.update(req.user.id, { password: hashed });
    const token = generateToken(req.user.id);
    res.json({ success: true, token, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/auth/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let addresses = [...(user.addresses || [])];
    const newAddr = { ...req.body, id: uuidv4() };
    if (newAddr.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    addresses.push(newAddr);
    await User.update(req.user.id, { addresses });
    res.status(201).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let addresses = [...(user.addresses || [])];
    const idx = addresses.findIndex((a) => a.id === req.params.addressId);
    if (idx === -1) return next(new AppError('Address not found', 404));
    if (req.body.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    addresses[idx] = { ...addresses[idx], ...req.body };
    await User.update(req.user.id, { addresses });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addresses = (user.addresses || []).filter((a) => a.id !== req.params.addressId);
    await User.update(req.user.id, { addresses });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist
// @route   POST /api/auth/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let wishlist = [...(user.wishlist || [])];
    const idx = wishlist.indexOf(req.params.productId);
    if (idx === -1) {
      wishlist.push(req.params.productId);
    } else {
      wishlist.splice(idx, 1);
    }
    await User.update(req.user.id, { wishlist });
    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const Product = require('../models/Product');
    const wishlistProducts = await Promise.all(
      (user.wishlist || []).map((pid) => Product.findById(pid))
    );
    res.json({ success: true, wishlist: wishlistProducts.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};
