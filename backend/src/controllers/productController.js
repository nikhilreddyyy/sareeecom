const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const { AppError } = require('../middleware/errorHandler');

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const countQuery = new APIFeatures(Product.find({ isActive: true }), req.query).filter().search(['name', 'fabric', 'tags']);
    const totalDocs = await countQuery.query.clone().countDocuments();

    const features = new APIFeatures(Product.find({ isActive: true }), req.query)
      .filter()
      .search(['name', 'fabric', 'tags'])
      .sort()
      .paginate();

    const products = await features.query.populate('category', 'name slug');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    res.json({
      success: true,
      count: products.length,
      total: totalDocs,
      page,
      pages: Math.ceil(totalDocs / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };
    const product = await Product.findOne(query).populate('category', 'name slug').populate('reviews.user', 'name avatar');
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
    if (!req.body.slug) req.body.slug = slugify(req.body.name) + '-' + Date.now();
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));
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

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return next(new AppError('You already reviewed this product', 400));

    product.reviews.push({ ...req.body, user: req.user._id, name: req.user.name });
    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(12)
      .sort('-createdAt');
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options (fabric, colors, etc.)
// @route   GET /api/products/filters
exports.getFilterOptions = async (req, res, next) => {
  try {
    const fabrics = await Product.distinct('fabric', { isActive: true });
    const colors = await Product.distinct('color', { isActive: true });
    const sizes = await Product.distinct('sizes', { isActive: true });
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$discountedPrice' }, max: { $max: '$price' } } },
    ]);
    res.json({ success: true, fabrics, colors, sizes, priceRange: priceRange[0] || { min: 0, max: 50000 } });
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
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();
    const products = await Product.find().populate('category', 'name').skip(skip).limit(limit).sort('-createdAt');
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), products });
  } catch (error) {
    next(error);
  }
};
