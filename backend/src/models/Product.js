const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [String],
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String },
      },
    ],
    videos: [
      {
        url: { type: String },
        publicId: { type: String },
        thumbnail: { type: String },
      },
    ],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    fabric: { type: String, required: true },
    color: [{ type: String }],
    sizes: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: { type: Number },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Auto-calculate discount
productSchema.pre('save', function (next) {
  if (this.discountedPrice && this.price > 0) {
    this.discountPercent = Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  if (this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ fabric: 1 });
productSchema.index({ color: 1 });

module.exports = mongoose.model('Product', productSchema);
