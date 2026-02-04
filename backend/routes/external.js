const express = require('express');
const router = express.Router();
const geocodeService = require('../services/geocodeService');
const weatherService = require('../services/weatherService');
const exchangeService = require('../services/exchangeRateService');
const ipService = require('../services/ipLocationService');

router.get('/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat & lon required' });
        const resGeo = await geocodeService.reverse(lat, lon);
        res.json({ success: true, data: resGeo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat & lon required' });
        const w = await weatherService.current(lat, lon);
        res.json({ success: true, data: w });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/convert', async (req, res) => {
    try {
        const { amount = 1, from = 'USD', to = 'INR' } = req.query;
        const conv = await exchangeService.convert(amount, from, to);
        res.json({ success: true, data: conv });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ip', async (req, res) => {
    try {
        const ip = req.query.ip;
        const data = await ipService.lookup(ip);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Open-Meteo current weather
router.get('/weather-open-meteo', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'lat & lon required' });
        const openM = require('../services/openMeteoService');
        const w = await openM.current(lat, lon);
        res.json({ success: true, data: w });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OSRM routing
router.get('/route/osrm', async (req, res) => {
    try {
        const { sLat, sLon, eLat, eLon, profile } = req.query;
        if (!sLat || !sLon || !eLat || !eLon) return res.status(400).json({ error: 'sLat, sLon, eLat, eLon required' });
        const osrm = require('../services/osrmService');
        const r = await osrm.route(parseFloat(sLat), parseFloat(sLon), parseFloat(eLat), parseFloat(eLon), profile || 'driving');
        res.json({ success: true, data: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Frankfurter currency convert
router.get('/convert/frankfurter', async (req, res) => {
    try {
        const { amount = 1, from = 'USD', to = 'EUR' } = req.query;
        const frank = require('../services/frankfurterService');
        const c = await frank.convert(amount, from, to);
        res.json({ success: true, data: c });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// IPWho
router.get('/ipwho', async (req, res) => {
    try {
        const ip = req.query.ip;
        const who = require('../services/ipwhoService');
        const d = await who.lookup(ip);
        res.json({ success: true, data: d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OWID CO2 latest
router.get('/co2/owid', async (req, res) => {
    try {
        const { country } = req.query;
        if (!country) return res.status(400).json({ error: 'country required' });
        const owid = require('../services/owidService');
        const d = await owid.getCountryLatest(country);
        res.json({ success: true, data: d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ElectricityMap latest carbon intensity (optional API key)
router.get('/co2/electricitymap', async (req, res) => {
    try {
        const { zone } = req.query; // e.g., 'IN' or 'GB' etc.
        const em = require('../services/electricityMapService');
        const d = await em.latest(zone);
        res.json({ success: true, data: d });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GraphHopper routing
router.get('/route/graphhopper', async (req, res) => {
    try {
        const { sLat, sLon, eLat, eLon, profile } = req.query;
        if (!sLat || !sLon || !eLat || !eLon) return res.status(400).json({ error: 'sLat, sLon, eLat, eLon required' });
        const gh = require('../services/graphhopperService');
        const r = await gh.route(parseFloat(sLat), parseFloat(sLon), parseFloat(eLat), parseFloat(eLon), profile || 'car');
        res.json({ success: true, data: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;