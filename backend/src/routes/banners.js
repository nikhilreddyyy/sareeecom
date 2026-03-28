const express = require('express');
const router = express.Router();
const { getBanners, adminGetBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getBanners);
router.get('/admin/all', protect, admin, adminGetBanners);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
