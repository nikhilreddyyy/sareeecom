const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.getAll();
    res.json({ success: true, coupons });
  } catch (error) { next(error); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) { next(error); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const existing = await Coupon.findById(req.params.id);
    if (!existing) return next(new AppError('Coupon not found', 404));
    const coupon = await Coupon.update(req.params.id, req.body);
    res.json({ success: true, coupon });
  } catch (error) { next(error); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.delete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) { next(error); }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByCode(req.body.code || '');
    if (!coupon) return next(new AppError('Invalid coupon code', 400));
    const validity = Coupon.isValid(coupon);
    if (!validity.valid) return next(new AppError(validity.message, 400));
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) { next(error); }
};
