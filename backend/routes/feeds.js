const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const gtfsService = require('../services/gtfsService');
const gtfsRealtimeService = require('../services/gtfsRealtimeService');

const upload = multer({ dest: path.join(__dirname, '..', 'data', 'uploads') });

// Upload a GTFS zip for a city
router.post('/upload/:cityId', upload.single('gtfs'), async (req, res) => {
    try {
        const { cityId } = req.params;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'GTFS zip file required' });

        const extracted = await gtfsService.loadGtfsZip(cityId, file.path);

        res.json({ success: true, cityId, summary: { stops: Object.keys(extracted.stops).length, routes: Object.keys(extracted.routes).length } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register GTFS-RT feed URL for a city
router.post('/register-rt/:cityId', (req, res) => {
    try {
        const { cityId } = req.params;
        const { url } = req.body;
        const io = req.app.get('io');

        if (!url) return res.status(400).json({ error: 'url required' });

        gtfsRealtimeService.registerFeed(cityId, url, io);

        res.json({ success: true, message: `GTFS-RT feed registered for ${cityId}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/list', (req, res) => {
    res.json({ success: true, feeds: gtfsService.listFeeds() });
});

module.exports = router;
