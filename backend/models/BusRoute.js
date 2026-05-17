const mongoose = require('mongoose');

const BusRouteSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  driverContact: {
    type: String,
    required: true,
  },
  driverKey: {
    type: String, // Secret key for driver login
    required: false,
  },
  stops: [{
    stopName: String,
    pickupTime: String,
    dropoffTime: String,
  }],
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  schoolId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BusRoute', BusRouteSchema);
