const User = require('../models/User.model');

/**
 * @desc    Get all users (with scoped view)
 * @route   GET /api/users
 * @access  Private
 */
exports.getUsers = async (req, res, next) => {
  try {
    let query = {};

    // Implement "Scoped Views" based on user role
    switch (req.user.role) {
      case 'DISTRICT_OFFICER':
        query = { 'hierarchy.district_id': req.user.hierarchy.district_id };
        break;
      case 'TALUKA_OFFICER':
        query = { 'hierarchy.taluka_id': req.user.hierarchy.taluka_id };
        break;
      case 'VILLAGE_OFFICER':
         // A village officer likely shouldn't see other users, but can be configured.
         // For now, they see only themselves.
        query = { _id: req.user._id };
        break;
      case 'STATE_ADMIN':
      default:
        // State Admin sees everyone
        query = {};
        break;
    }

    const users = await User.find(query);
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Don't allow password or role to be updated this way for security
    const { password, role, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};