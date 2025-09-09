// server/models/Rider.js
const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true },
  phone: { type: String },
  // bucketList stores order ids the rider added
  bucketList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  // optional metadata
  lastOnlineAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);
