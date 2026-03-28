const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('parent', 'name slug').sort('sortOrder');
    res.json({ success: true, categories });
  } catch (error) { next(error); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { slug: req.params.id };
    const category = await Category.findOne(query).populate('parent', 'name slug');
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, category });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    if (!req.body.slug) req.body.slug = slugify(req.body.name);
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, category });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};
