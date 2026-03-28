const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addReview, getFeaturedProducts, getFilterOptions, adminGetProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: fabric
 *         schema: { type: string }
 *       - in: query
 *         name: color
 *         schema: { type: string }
 *       - in: query
 *         name: price[gte]
 *         schema: { type: number }
 *       - in: query
 *         name: price[lte]
 *         schema: { type: number }
 */
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/filters', getFilterOptions);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
