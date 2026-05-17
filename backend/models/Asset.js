const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  serialNumber: String,
  purchaseDate: Date,
  cost: Number,
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Scrapped'],
    default: 'Active',
  },
  assignedTo: String,
  schoolId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Asset', AssetSchema);
