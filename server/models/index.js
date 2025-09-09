// server/models/index.js
const mongoose = require('mongoose');

// Import all models with exact casing
require('./User');
require('./Product');
require('./Order');
require('./Pincode');
require('./RiderLocation');

// Export mongoose connection and models
module.exports = {
  mongoose,
  User: mongoose.model('User'),
  Product: mongoose.model('Product'),
  Order: mongoose.model('Order'),
  Pincode: mongoose.model('Pincode'),
  RiderLocation: mongoose.model('RiderLocation')
};
