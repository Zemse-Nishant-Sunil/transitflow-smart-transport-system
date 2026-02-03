const express = require('express');
const router = express.Router();
const journeyPlanner = require('../services/journeyPlanner');
const realtimeService = require('../services/realtimeService');
const analyticsService = require('../services/analyticsService');

// Plan a journey
router.post('/plan', (req, res) => {
    try {
        const { origin, destination, preferences } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ error: 'Origin and destination are required' });
        }

        const routes = journeyPlanner.planJourney(origin, destination, preferences);

        // Log journey planning for analytics
        analyticsService.logJourney({
            from: origin,
            to: destination,
            routesFound: routes.length,
            preferences
        });

        res.json({
            success: true,
            routes: routes,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Journey planning error:', error);
        res.status(500).json({ error: 'Failed to plan journey', message: error.message });
    }
});

// Get journey details
router.get('/:journeyId', (req, res) => {
    try {
        const { journeyId } = req.params;
        const journey = realtimeService.getJourneyStatus(journeyId);

        if (!journey) {
            return res.status(404).json({ error: 'Journey not found' });
        }

        res.json({
            success: true,
            journey
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get journey details', message: error.message });
    }
});

// Start tracking a journey
router.post('/:journeyId/track', (req, res) => {
    try {
        const { journeyId } = req.params;
        const journeyData = req.body;

        realtimeService.trackJourney(journeyId, journeyData);

        res.json({
            success: true,
            message: 'Journey tracking started',
            journeyId
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start tracking', message: error.message });
    }
});

// Stop tracking a journey
router.delete('/:journeyId/track', (req, res) => {
    try {
        const { journeyId } = req.params;
        realtimeService.stopTracking(journeyId);

        res.json({
            success: true,
            message: 'Journey tracking stopped'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop tracking', message: error.message });
    }
});

// Get alternative routes for disruption
router.post('/:journeyId/alternatives', (req, res) => {
    try {
        const { journeyId } = req.params;
        const { disruptedSegment } = req.body;

        const originalJourney = realtimeService.getJourneyStatus(journeyId);

        if (!originalJourney) {
            return res.status(404).json({ error: 'Journey not found' });
        }

        const alternatives = journeyPlanner.generateAlternatives(originalJourney, disruptedSegment);

        res.json({
            success: true,
            alternatives,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate alternatives', message: error.message });
    }
});

// Find nearest station
router.post('/nearest-station', (req, res) => {
    try {
        const { lat, lng, mode } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const result = journeyPlanner.findNearestStation(lat, lng, mode);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to find nearest station', message: error.message });
    }
});

module.exports = router;