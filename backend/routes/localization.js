const express = require('express');
const router = express.Router();
const localizationService = require('../services/localizationService');

router.get('/detect', (req, res) => {
    // Accept countryCode query (e.g., ?country=IN)
    const country = (req.query.country || '').toUpperCase();
    const detection = localizationService.detectLanguageFromLocation({ countryCode: country });

    res.json({ success: true, detection });
});

router.get('/languages', (req, res) => {
    res.json({ success: true, languages: localizationService.available });
});

module.exports = router;