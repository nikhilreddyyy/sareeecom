const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/auth');
const {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
  toggleActive,
} = require('../controllers/adminAccountsController');

// All routes require a logged-in admin
router.use(protect, admin);

router.get('/', getAdminAccounts);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  createAdminAccount
);

router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  updateAdminAccount
);

router.delete('/:id', deleteAdminAccount);
router.post('/:id/toggle-active', toggleActive);

module.exports = router;
