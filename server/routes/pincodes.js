const express = require('express');
const Pincode = require('../models/Pincode');
const router = express.Router();

// Get all available pincodes
router.get('/', async (req, res) => {
  try {
    const pincodes = await Pincode.find({ deliveryAvailable: true });
    res.json(pincodes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching pincodes' });
  }
});

module.exports = router;