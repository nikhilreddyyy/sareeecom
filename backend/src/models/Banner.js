const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    video: { type: String },
    link: { type: String },
    linkText: { type: String },
    position: { type: String, enum: ['hero', 'offer', 'sidebar', 'popup'], default: 'hero' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
