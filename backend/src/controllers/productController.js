const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.fabric) filters.fabric = req.query.fabric;
    if (req.query.color) filters.color = req.query.color;
    if (req.query.size) filters.size = req.query.size;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);

    const result = await Product.getAll({
      filters,
      search: req.query.search || '',
      sort: req.query.sort || '-createdAt',
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) product = await Product.findBySlug(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return next(new AppError('Product not found', 404));
    const product = await Product.update(req.params.id, req.body);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return next(new AppError('Product not found', 404));
    await Product.delete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const alreadyReviewed = (product.reviews || []).find((r) => r.user === req.user.id);
    if (alreadyReviewed) return next(new AppError('You already reviewed this product', 400));

    await Product.addReview(req.params.id, {
      user: req.user.id,
      name: req.user.name,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || [],
    });
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.getFeatured(12);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options
// @route   GET /api/products/filters
exports.getFilterOptions = async (req, res, next) => {
  try {
    const options = await Product.getFilterOptions();
    res.json({ success: true, ...options });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all products (including inactive)
// @route   GET /api/admin/products
exports.adminGetProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await Product.getAll({ page, limit, adminMode: true });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
