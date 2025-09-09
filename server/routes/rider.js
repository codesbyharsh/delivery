// server/routes/rider.js
const express = require('express');
const RiderLocation = require('../models/RiderLocation');
const router = express.Router();

// Save rider location
router.post('/location', async (req, res) => {
  try {
    const { username, latitude, longitude, timestamp } = req.body;

    // Basic validation
    if (!username || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    console.log(`Saving rider location: ${username} ${latitude},${longitude} at ${timestamp || new Date().toISOString()}`);

    const location = new RiderLocation({
      username,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString()
    });
    await location.save();

    res.json({ message: 'Location saved' });
  } catch (e) {
    console.error('Error saving rider location:', e);
    res.status(500).json({ message: 'Error saving location' });
  }
});

module.exports = router;
