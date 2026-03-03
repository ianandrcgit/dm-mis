const User = require('../models/User.model');

const normalizeRole = (role) => {
  return (role || '').toString().trim().toUpperCase();
};

exports.createUser = async (req, res) => {
  try {
    const role = normalizeRole(req.body.role);
    const hierarchy = req.body.hierarchy || {};
    const { password } = req.body;

    // Strict Hierarchy Validation
    if (role === 'DISTRICT_OFFICER' && !hierarchy?.district_id) {
      return res.status(400).json({ message: "District ID is required for District Officers" });
    }
    if (role === 'TALUKA_OFFICER' && (!hierarchy?.district_id || !hierarchy?.taluka_id)) {
      return res.status(400).json({ message: "District and Taluka ID are required for Taluka Officers" });
    }
    if (role === 'VILLAGE_OFFICER' && (!hierarchy?.district_id || !hierarchy?.taluka_id || !hierarchy?.village_id)) {
      return res.status(400).json({ message: "District, Taluka, and Village ID are required for Village Officers" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const payload = {
      ...req.body,
      role,
      hierarchy: {
        district_id: hierarchy.district_id || null,
        taluka_id: hierarchy.taluka_id || null,
        village_id: hierarchy.village_id || null,
      },
    };

    const user = await User.create(payload);

    // Exclude password from the response
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, data: userResponse });
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(400).json({ success: false, message: "User creation failed due to invalid data." });
  }
};

exports.getUsers = async (req, res) => {
  try {
    let query = {};
    const role = normalizeRole(req.user.role);
    const hierarchy = req.user.hierarchy || {};

    // Implementation of Scoped Views
    if (role === 'DISTRICT_OFFICER') {
      query['hierarchy.district_id'] = hierarchy?.district_id;
    } else if (role === 'TALUKA_OFFICER') {
      query['hierarchy.district_id'] = hierarchy?.district_id;
      query['hierarchy.taluka_id'] = hierarchy?.taluka_id;
    } else if (role === 'VILLAGE_OFFICER') {
      query['hierarchy.district_id'] = hierarchy?.district_id;
      query['hierarchy.taluka_id'] = hierarchy?.taluka_id;
      query['hierarchy.village_id'] = hierarchy?.village_id;
    }

    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Do not allow password to be updated from this generic endpoint
    const { password, ...updateData } = req.body;
    const normalizedRole = normalizeRole(updateData.role);

    if (updateData.role) {
      updateData.role = normalizedRole;
    }

    if (updateData.hierarchy) {
      updateData.hierarchy = {
        district_id: updateData.hierarchy.district_id || null,
        taluka_id: updateData.hierarchy.taluka_id || null,
        village_id: updateData.hierarchy.village_id || null,
      };
    }

    const finalRole = updateData.role;
    const finalHierarchy = updateData.hierarchy || {};

    if (finalRole === 'DISTRICT_OFFICER' && !finalHierarchy.district_id) {
      return res.status(400).json({ success: false, message: "District ID is required for District Officers" });
    }
    if (finalRole === 'TALUKA_OFFICER' && (!finalHierarchy.district_id || !finalHierarchy.taluka_id)) {
      return res.status(400).json({ success: false, message: "District and Taluka ID are required for Taluka Officers" });
    }
    if (finalRole === 'VILLAGE_OFFICER' && (!finalHierarchy.district_id || !finalHierarchy.taluka_id || !finalHierarchy.village_id)) {
      return res.status(400).json({ success: false, message: "District, Taluka, and Village ID are required for Village Officers" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(400).json({ success: false, message: "User update failed." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password.trim();
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error("Error updating user password:", err.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
