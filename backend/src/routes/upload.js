const express = require('express');
const router = express.Router();
const { uploadImages, uploadVideo, deleteFile } = require('../controllers/uploadController');
const { uploadImage, uploadVideo: uploadVideoStorage } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth');

router.post('/images', protect, admin, uploadImage.array('images', 10), uploadImages);
router.post('/video', protect, admin, uploadVideoStorage.single('video'), uploadVideo);
router.delete('/', protect, admin, deleteFile);

module.exports = router;
