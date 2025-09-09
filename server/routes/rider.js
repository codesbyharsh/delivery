// server/routes/rider.js
const express = require('express');
const RiderLocation = require('../models/RiderLocation');
const Rider = require('../models/Rider'); // optional, to validate rider and update lastOnlineAt
const router = express.Router();

// Upsert current location for a rider (replace previous)
router.post('/location', async (req, res) => {
  try {
    const { username, name, latitude, longitude, timestamp } = req.body;

    if (!username || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const ts = timestamp ? new Date(timestamp) : new Date();

    // upsert the single current location document for that username
    const saved = await RiderLocation.findOneAndUpdate(
      { username },
      { username, name, latitude, longitude, timestamp: ts },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // update rider lastOnlineAt (optional, if Rider exists)
    try {
      await Rider.findOneAndUpdate({ username }, { lastOnlineAt: new Date() });
    } catch (e) {
      // non-fatal if Rider isn't present
      console.warn('Rider update failed (non-fatal):', e.message);
    }

    res.json({ message: 'Location saved', data: saved });
  } catch (e) {
    console.error('Error saving rider location:', e);
    res.status(500).json({ message: 'Error saving location' });
  }
});

module.exports = router;
