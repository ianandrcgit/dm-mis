const mongoose = require('mongoose');

const DisasterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FLOOD', 'FIRE', 'EARTHQUAKE', 'CYCLONE', 'DROUGHT'],
    required: [true, 'Please specify the type of disaster'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  loss_type: {
    type: String,
    enum: ['HUMAN_LOSS', 'ANIMAL_LOSS', 'CROP_LOSS', 'HOUSE_DAMAGE'],
    required: [true, 'Please specify the type of loss/damage'],
  },
  beneficiary: {
    name: { type: String, required: [true, 'Please provide beneficiary name'] },
    aadhaar_number: { type: String, required: [true, 'Please provide Aadhaar number'] },
    date_of_loss: { type: Date, required: [true, 'Please provide date of loss'] },
  },
  location: {
    district_id: { type: String, required: true },
    taluka_id: { type: String, required: true },
    hobli_id: { type: String, default: null },
    village_id: { type: String, required: true },
  },
  photo_url: {
    type: String,
  },
  reported_by: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'],
    default: 'REPORTED',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Disaster', DisasterSchema);
