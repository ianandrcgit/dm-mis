const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// All routes below are protected
router.use(protect);

router.route('/')
  .get(authorizeRoles('STATE_ADMIN', 'DISTRICT_OFFICER', 'TALUKA_OFFICER'), getUsers)
  .post(authorizeRoles('STATE_ADMIN'), createUser);

router.route('/:id')
  .put(authorizeRoles('STATE_ADMIN'), updateUser)
  .delete(authorizeRoles('STATE_ADMIN'), deleteUser);

module.exports = router;