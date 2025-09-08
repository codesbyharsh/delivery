const express = require('express');
const RiderLocation = require('../models/RiderLocation');
const router = express.Router();

// Save rider location
router.post('/location', async (req, res) => {
  try {
    const { username, latitude, longitude, timestamp } = req.body;
    
    const location = new RiderLocation({ username, latitude, longitude, timestamp });
    await location.save();
    
    res.json({ message: 'Location saved' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error saving location' });
  }
});

module.exports = router;