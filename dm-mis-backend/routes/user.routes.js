const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
} = require('../controllers/user.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// Protect all routes in this file
router.use(protect);

router.route('/').get(getUsers).post(authorizeRoles('ADMIN'), createUser);

router.route('/:id').put(authorizeRoles('ADMIN'), updateUser).delete(authorizeRoles('ADMIN'), deleteUser);
router.route('/:id/password').patch(authorizeRoles('ADMIN'), updateUserPassword);

module.exports = router;
