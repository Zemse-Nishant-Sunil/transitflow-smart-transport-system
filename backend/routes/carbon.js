const express = require('express');
const router = express.Router();
const carbonService = require('../services/carbonService');

router.post('/estimate', (req, res) => {
    try {
        const { route } = req.body;
        if (!route) return res.status(400).json({ error: 'route required' });

        const estimate = carbonService.estimateRoute(route);
        res.json({ success: true, estimate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;