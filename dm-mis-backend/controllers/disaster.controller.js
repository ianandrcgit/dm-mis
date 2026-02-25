const Disaster = require('../models/Disaster.model');

// @desc    Create a new disaster report
// @route   POST /api/disasters
// @access  Private (Village Officer)
exports.createDisaster = async (req, res) => {
  try {
    const { type, description, loss_type, beneficiary } = req.body;
    const reportingUser = req.user; // from 'protect' middleware

    // A village officer must have a complete hierarchy
    if (!reportingUser.hierarchy?.village_id || !reportingUser.hierarchy?.hobli_id) {
      return res.status(400).json({ success: false, message: 'User does not have a complete village/hobli hierarchy assigned.' });
    }

    // Since the data is coming from multipart/form-data, beneficiary will be a stringified JSON
    if (!beneficiary || typeof beneficiary !== 'string') {
      return res.status(400).json({ success: false, message: 'Beneficiary data is missing or invalid.' });
    }
    const parsedBeneficiary = JSON.parse(beneficiary);

    const photo_url = req.file ? `/uploads/${req.file.filename}` : '';

    const disaster = await Disaster.create({
      type,
      description,
      loss_type,
      beneficiary: parsedBeneficiary,
      photo_url,
      location: reportingUser.hierarchy,
      reported_by: reportingUser._id,
    });

    res.status(201).json({ success: true, data: disaster });
  } catch (err) {
    console.error("❌ Error creating disaster report:", err.message);
    res.status(400).json({ success: false, message: "Disaster report creation failed." });
  }
};

// @desc    Get disaster reports based on user's scope
// @route   GET /api/disasters
// @access  Private
exports.getDisasters = async (req, res) => {
  try {
    let query = {};
    const { role, hierarchy } = req.user;

    // Scoped view for disasters
    switch (role) {
      case 'DISTRICT_OFFICER':
        query['location.district_id'] = hierarchy?.district_id;
        break;
      case 'TALUKA_OFFICER':
        query['location.taluka_id'] = hierarchy?.taluka_id;
        break;
      case 'VILLAGE_OFFICER':
        query['location.village_id'] = hierarchy?.village_id;
        break;
    }

    const disasters = await Disaster.find(query).populate('reported_by', 'name email');
    res.status(200).json({ success: true, data: disasters });
  } catch (err) {
    console.error("❌ Error fetching disasters:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};