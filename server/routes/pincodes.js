const express = require('express');
const Pincode = require('../models/Pincode'); // Make sure this path is correct

const router = express.Router();

// Get all available pincodes
router.get('/', async (req, res) => {
  try {
    console.log('Fetching pincodes...');
    const pincodes = await Pincode.find({ deliveryAvailable: true });
    console.log('Pincodes found:', pincodes.length);
    res.json(pincodes);
  } catch (e) {
    console.error('Error in pincodes route:', e);
    res.status(500).json({ message: 'Error fetching pincodes', error: e.message });
  }
});

module.exports = router;