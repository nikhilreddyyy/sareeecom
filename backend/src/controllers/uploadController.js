const { cloudinary } = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }
    const uploaded = req.files.map(f => ({
      url: f.path,
      publicId: f.filename,
    }));
    res.json({ success: true, images: uploaded });
  } catch (error) {
    next(error);
  }
};

exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));
    res.json({ success: true, video: { url: req.file.path, publicId: req.file.filename } });
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};
