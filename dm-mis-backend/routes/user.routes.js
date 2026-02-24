const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// Protect all routes in this file
router.use(protect);

router.route('/').get(getUsers).post(authorizeRoles('STATE_ADMIN'), createUser);

router.route('/:id').put(authorizeRoles('STATE_ADMIN'), updateUser).delete(authorizeRoles('STATE_ADMIN'), deleteUser);

module.exports = router;