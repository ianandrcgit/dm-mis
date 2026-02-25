const User = require('../models/User.model');

exports.createUser = async (req, res) => {
  try {
    const { role, hierarchy, password } = req.body;

    // Strict Hierarchy Validation
    if (role === 'DISTRICT_OFFICER' && !hierarchy?.district_id) {
      return res.status(400).json({ message: "District ID is required for District Officers" });
    }
    if (role === 'TALUKA_OFFICER' && (!hierarchy?.district_id || !hierarchy?.taluka_id)) {
      return res.status(400).json({ message: "District and Taluka ID are required for Taluka Officers" });
    }
    if (role === 'VILLAGE_OFFICER' && (!hierarchy?.district_id || !hierarchy?.taluka_id || !hierarchy?.hobli_id || !hierarchy?.village_id)) {
      return res.status(400).json({ message: "District, Taluka, Hobli, and Village ID are required for Village Officers" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.create(req.body);

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
    const { role, hierarchy } = req.user; // From Auth Middleware

    // Implementation of Scoped Views
    if (role === 'DISTRICT_OFFICER') {
      query['hierarchy.district_id'] = hierarchy?.district_id;
    } else if (role === 'TALUKA_OFFICER') {
      query['hierarchy.taluka_id'] = hierarchy?.taluka_id;
    } else if (role === 'VILLAGE_OFFICER') {
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