const express = require('express');
const router = express.Router();
const { getUsers, getUser, toggleBlock } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/toggle-block', toggleBlock);

module.exports = router;
