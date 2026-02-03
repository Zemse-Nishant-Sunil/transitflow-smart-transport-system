const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Get popular routes
router.get('/popular-routes', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const routes = analyticsService.getPopularRoutes(limit);

        res.json({
            success: true,
            routes,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get popular routes', message: error.message });
    }
});

// Get disruption hotspots
router.get('/disruption-hotspots', (req, res) => {
    try {
        const hotspots = analyticsService.getDisruptionHotspots();

        res.json({
            success: true,
            hotspots,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get disruption hotspots', message: error.message });
    }
});

// Get congestion patterns
router.get('/congestion-patterns', (req, res) => {
    try {
        const patterns = analyticsService.getCongestionPatterns();

        res.json({
            success: true,
            patterns,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get congestion patterns', message: error.message });
    }
});

// Get time series data
router.get('/timeseries/:metric', (req, res) => {
    try {
        const { metric } = req.params;
        const period = req.query.period || '7d';

        const data = analyticsService.getTimeSeriesData(metric, period);

        res.json({
            success: true,
            metric,
            period,
            data,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get time series data', message: error.message });
    }
});

// Get recommendations for planners
router.get('/recommendations', (req, res) => {
    try {
        const recommendations = analyticsService.getRecommendations();

        res.json({
            success: true,
            recommendations,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get recommendations', message: error.message });
    }
});

// Get system health metrics
router.get('/system-health', (req, res) => {
    try {
        const health = analyticsService.getSystemHealthMetrics();

        res.json({
            success: true,
            health,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get system health', message: error.message });
    }
});

// Dashboard overview
router.get('/dashboard', (req, res) => {
    try {
        const health = analyticsService.getSystemHealthMetrics();
        const hotspots = analyticsService.getDisruptionHotspots();
        const patterns = analyticsService.getCongestionPatterns();
        const recommendations = analyticsService.getRecommendations();

        res.json({
            success: true,
            dashboard: {
                health,
                topDisruptions: hotspots.slice(0, 5),
                topCongestion: patterns.slice(0, 5),
                recommendations: recommendations.filter(r => r.priority === 'high')
            },
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get dashboard data', message: error.message });
    }
});

module.exports = router;