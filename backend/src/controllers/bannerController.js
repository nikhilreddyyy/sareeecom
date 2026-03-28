const Banner = require('../models/Banner');
const { AppError } = require('../middleware/errorHandler');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getActive({ position: req.query.position });
    res.json({ success: true, banners });
  } catch (error) { next(error); }
};

exports.adminGetBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getAll();
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
    const existing = await Banner.findById(req.params.id);
    if (!existing) return next(new AppError('Banner not found', 404));
    const banner = await Banner.update(req.params.id, req.body);
    res.json({ success: true, banner });
  } catch (error) { next(error); }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    await Banner.delete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) { next(error); }
};
