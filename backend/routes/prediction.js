const express = require('express');
const router = express.Router();
const crowdPredictor = require('../services/crowdPredictor');

// Simple endpoint to get crowd prediction for a station & time
router.get('/station', (req, res) => {
    try {
        const { station, hour, dayOfWeek, cityId } = req.query;
        if (!station) return res.status(400).json({ error: 'station required' });

        const pred = crowdPredictor.getPrediction({ station, hour: parseInt(hour || new Date().getHours()), dayOfWeek: dayOfWeek || new Date().getDay(), cityId });
        res.json({ success: true, prediction: pred });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;