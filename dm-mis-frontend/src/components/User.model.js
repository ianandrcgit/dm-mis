const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  role: {
    type: String,
    enum: ['STATE_ADMIN', 'DISTRICT_OFFICER', 'TALUKA_OFFICER', 'VILLAGE_OFFICER'],
    default: 'VILLAGE_OFFICER',
  },
  hierarchy: {
    district_id: { type: String },
    taluka_id: { type: String },
    hobli_id: { type: String },
    village_id: { type: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Custom validation for hierarchy based on role
UserSchema.path('hierarchy').validate(function (value) {
  const role = this.role;
  if (role === 'DISTRICT_OFFICER' && !value.district_id) {
    throw new Error('District Officer must have a district_id.');
  }
  if (role === 'TALUKA_OFFICER' && (!value.district_id || !value.taluka_id)) {
    throw new Error('Taluka Officer must have a district_id and taluka_id.');
  }
  if (role === 'VILLAGE_OFFICER' && (!value.district_id || !value.taluka_id || !value.hobli_id || !value.village_id)) {
    throw new Error('Village Officer must have a complete hierarchy (district, taluka, hobli, village).');
  }
  return true;
}, 'Hierarchy validation failed for the selected role.');

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', UserSchema);