const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const total = await User.countDocuments({ role: 'user' });
    const users = await User.find({ role: 'user' }).skip(skip).limit(limit).sort('-createdAt');
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
  } catch (error) { next(error); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot block admin', 403));
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (error) { next(error); }
};
