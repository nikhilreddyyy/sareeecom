const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const result = await User.getAll({ page, limit, search: req.query.search || '' });
    const users = result.users.filter((u) => u.role !== 'admin');
    res.json({ success: true, total: result.total, page, pages: Math.ceil(result.total / limit), users });
  } catch (error) { next(error); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user: { ...user, _id: user.id } });
  } catch (error) { next(error); }
};

exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot block admin', 403));
    const updated = await User.update(req.params.id, { isBlocked: !user.isBlocked });
    res.json({ success: true, isBlocked: updated.isBlocked });
  } catch (error) { next(error); }
};
