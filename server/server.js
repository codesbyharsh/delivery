const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const deliveryRoutes = require('./routes/delivery');
const orderRoutes = require('./routes/orders');
const riderRoutes = require('./routes/rider');
const pincodeRoutes = require('./routes/pincodes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/delivery', deliveryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/pincodes', pincodeRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Delivery app server running on port ${PORT}`);
});