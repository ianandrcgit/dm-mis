const Disaster = require('../models/Disaster.model');

const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

const getScopedDisasterQuery = (user, includeStageFilter = true) => {
  const role = normalizeRole(user?.role);
  const hierarchy = user?.hierarchy || {};

  switch (role) {
    case 'ADMIN':
      return {};
    case 'STATE_ADMIN':
      return includeStageFilter ? { status: 'IN_PROGRESS' } : {};
    case 'DISTRICT_OFFICER':
      return includeStageFilter
        ? { 'location.district_id': hierarchy?.district_id, status: 'ACKNOWLEDGED' }
        : { 'location.district_id': hierarchy?.district_id };
    case 'TALUKA_OFFICER':
      return includeStageFilter
        ? { 'location.taluka_id': hierarchy?.taluka_id, status: 'REPORTED' }
        : { 'location.taluka_id': hierarchy?.taluka_id };
    case 'VILLAGE_OFFICER':
      return { reported_by: user?._id };
    default:
      return { reported_by: user?._id };
  }
};

const getCurrentLoginLabel = (status) => {
  switch ((status || '').toString().trim().toUpperCase()) {
    case 'DRAFT':
      return 'VILLAGE_OFFICER';
    case 'REPORTED':
      return 'TALUKA_OFFICER';
    case 'ACKNOWLEDGED':
      return 'DISTRICT_OFFICER';
    case 'IN_PROGRESS':
      return 'STATE_ADMIN';
    case 'RESOLVED':
      return 'COMPLETED';
    default:
      return 'UNKNOWN';
  }
};

const enrichDisasterForReporting = (disaster) => {
  const plainDisaster = disaster.toObject ? disaster.toObject() : disaster;

  return {
    ...plainDisaster,
    current_login: getCurrentLoginLabel(plainDisaster.status),
  };
};

// @desc    Create a new disaster report
// @route   POST /api/disasters
// @access  Private (Village Officer)
exports.createDisaster = async (req, res) => {
  try {
    const { type, description, loss_type, beneficiary, submissionType } = req.body;
    const reportingUser = req.user;

    if (!reportingUser.hierarchy?.village_id || !reportingUser.hierarchy?.taluka_id || !reportingUser.hierarchy?.district_id) {
      return res.status(400).json({ success: false, message: 'User does not have a complete village hierarchy assigned.' });
    }

    if (!beneficiary || typeof beneficiary !== 'string') {
      return res.status(400).json({ success: false, message: 'Beneficiary data is missing or invalid.' });
    }

    const parsedBeneficiary = JSON.parse(beneficiary);
    const photo_url = req.file ? `/uploads/${req.file.filename}` : '';
    const status = submissionType === 'DRAFT' ? 'DRAFT' : 'REPORTED';

    const disaster = await Disaster.create({
      type,
      description,
      loss_type,
      beneficiary: parsedBeneficiary,
      photo_url,
      location: {
        district_id: reportingUser.hierarchy?.district_id,
        taluka_id: reportingUser.hierarchy?.taluka_id,
        hobli_id: reportingUser.hierarchy?.hobli_id || '',
        village_id: reportingUser.hierarchy?.village_id,
      },
      reported_by: reportingUser._id,
      status,
    });

    res.status(201).json({ success: true, data: disaster });
  } catch (err) {
    console.error('Error creating disaster report:', err.message);
    res.status(400).json({ success: false, message: 'Disaster report creation failed.' });
  }
};

// @desc    Get disaster reports based on user's scope
// @route   GET /api/disasters
// @access  Private
exports.getDisasters = async (req, res) => {
  try {
    const query = getScopedDisasterQuery(req.user, false);
    const disasters = await Disaster.find(query)
      .sort({ createdAt: -1 })
      .populate('reported_by', 'name email role');
    res.status(200).json({
      success: true,
      data: disasters.map(enrichDisasterForReporting),
    });
  } catch (err) {
    console.error('Error fetching disasters:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update disaster status based on role workflow
// @route   PATCH /api/disasters/:id/status
// @access  Private
exports.updateDisasterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const role = normalizeRole(req.user?.role);
    const targetStatus = (req.body?.status || '').toString().trim().toUpperCase();

    const allowedTransitions = {
      VILLAGE_OFFICER: { from: 'DRAFT', to: 'REPORTED' },
      TALUKA_OFFICER: { from: 'REPORTED', to: 'ACKNOWLEDGED' },
      DISTRICT_OFFICER: { from: 'ACKNOWLEDGED', to: 'IN_PROGRESS' },
      STATE_ADMIN: { from: 'IN_PROGRESS', to: 'RESOLVED' },
      ADMIN: null,
    };

    if (!allowedTransitions[role]) {
      return res.status(403).json({ success: false, message: `Role '${role}' cannot update disaster status.` });
    }

    const disaster = await Disaster.findOne({
      _id: id,
      ...getScopedDisasterQuery(req.user, false),
    });

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Disaster report not found for this login scope.' });
    }

    if (role !== 'ADMIN') {
      const transition = allowedTransitions[role];
      if (targetStatus !== transition.to || disaster.status !== transition.from) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition for ${role}. Expected ${transition.from} -> ${transition.to}.`,
        });
      }
    }

    disaster.status = targetStatus;
    await disaster.save();

    return res.status(200).json({ success: true, data: disaster });
  } catch (err) {
    console.error('Error updating disaster status:', err.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
