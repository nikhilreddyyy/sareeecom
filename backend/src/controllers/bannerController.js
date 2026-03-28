const Banner = require('../models/Banner');
const { AppError } = require('../middleware/errorHandler');

exports.getBanners = async (req, res, next) => {
  try {
    const position = req.query.position;
    const query = { isActive: true };
    if (position) query.position = position;
    const banners = await Banner.find(query).sort('sortOrder');
    res.json({ success: true, banners });
  } catch (error) { next(error); }
};

exports.adminGetBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('sortOrder');
    res.json({ success: true, banners });
  } catch (error) { next(error); }
};

exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (error) { next(error); }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return next(new AppError('Banner not found', 404));
    res.json({ success: true, banner });
  } catch (error) { next(error); }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) { next(error); }
};
