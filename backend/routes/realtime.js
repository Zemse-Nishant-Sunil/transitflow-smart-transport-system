const express = require('express');
const router = express.Router();
const realtimeService = require('../services/realtimeService');

// Get platform information
router.get('/platform/:stationId/:mode', (req, res) => {
    try {
        const { stationId, mode } = req.params;
        const platforms = realtimeService.getPlatformInfo(stationId, mode);

        res.json({
            success: true,
            station: stationId,
            mode: mode,
            platforms: platforms,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get platform info', message: error.message });
    }
});

// Get nearby vehicles
router.post('/nearby', (req, res) => {
    try {
        const { lat, lng, mode, radius } = req.body;

        if (!lat || !lng || !mode) {
            return res.status(400).json({ error: 'Latitude, longitude, and mode are required' });
        }

        const vehicles = realtimeService.getNearbyVehicles(lat, lng, mode, radius);

        res.json({
            success: true,
            vehicles: vehicles,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get nearby vehicles', message: error.message });
    }
});

// Initialize realtime service (called by server)
router.post('/initialize', (req, res) => {
    try {
        const io = req.app.get('io');
        realtimeService.initialize(io);

        res.json({
            success: true,
            message: 'Realtime service initialized'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize realtime service', message: error.message });
    }
});

module.exports = router;