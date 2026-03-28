const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAll({ activeOnly: true });
    res.json({ success: true, categories });
  } catch (error) { next(error); }
};

exports.getCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) category = await Category.findBySlug(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, category });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return next(new AppError('Category not found', 404));
    const category = await Category.update(req.params.id, req.body);
    res.json({ success: true, category });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.delete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};
