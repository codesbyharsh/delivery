const mongoose = require('mongoose');

const riderLocationSchema = new mongoose.Schema({
  username: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('RiderLocation', riderLocationSchema);