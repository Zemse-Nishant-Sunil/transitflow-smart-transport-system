const express = require('express');
const router = express.Router();
const realtimeService = require('../services/realtimeService');
const analyticsService = require('../services/analyticsService');

// Get active disruptions
router.get('/active', (req, res) => {
    try {
        // In a real system, this would query a database
        // For mock, we'll generate some sample disruptions
        const disruptions = [
            {
                id: 'dis_1',
                type: 'signal_failure',
                severity: 'high',
                line: 'Western Line',
                affected: 'Dadar - Bandra',
                delay: 15,
                message: 'Signal failure between Dadar and Bandra. Trains running with 15-minute delays.',
                startTime: new Date(Date.now() - 30 * 60000),
                estimatedResolution: new Date(Date.now() + 15 * 60000),
                affectedCommuters: 3500
            },
            {
                id: 'dis_2',
                type: 'crowd',
                severity: 'medium',
                line: 'Central Line',
                affected: 'Thane - Kurla',
                delay: 5,
                message: 'Heavy crowd at Thane station. Boarding delays expected.',
                startTime: new Date(Date.now() - 15 * 60000),
                estimatedResolution: new Date(Date.now() + 30 * 60000),
                affectedCommuters: 1200
            },
            {
                id: 'dis_3',
                type: 'weather',
                severity: 'low',
                line: 'Metro Line 1',
                affected: 'All stations',
                delay: 3,
                message: 'Light rain affecting metro services. Minor delays possible.',
                startTime: new Date(Date.now() - 45 * 60000),
                estimatedResolution: new Date(Date.now() + 60 * 60000),
                affectedCommuters: 800
            }
        ];

        res.json({
            success: true,
            disruptions,
            count: disruptions.length,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get active disruptions', message: error.message });
    }
});

// Get disruption history
router.get('/history', (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const line = req.query.line;

        // This would query historical data
        const history = [];
        for (let i = 0; i < days; i++) {
            const count = Math.floor(Math.random() * 5) + 1;
            history.push({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                count: count,
                avgDelay: Math.floor(Math.random() * 15) + 5,
                totalAffected: count * (Math.floor(Math.random() * 2000) + 500)
            });
        }

        res.json({
            success: true,
            line: line || 'all',
            period: `${days} days`,
            history: history.reverse(),
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get disruption history', message: error.message });
    }
});

// Report a disruption (for commuters)
router.post('/report', (req, res) => {
    try {
        const { type, location, description, severity } = req.body;

        if (!type || !location) {
            return res.status(400).json({ error: 'Type and location are required' });
        }

        const report = {
            id: `report_${Date.now()}`,
            type,
            location,
            description,
            severity: severity || 'medium',
            reportedAt: new Date(),
            status: 'pending_verification',
            reportedBy: 'commuter'
        };

        // Log for analytics
        analyticsService.logDisruption(report);

        res.json({
            success: true,
            message: 'Disruption report submitted successfully',
            report
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit report', message: error.message });
    }
});

// Get disruption alerts for a specific route
router.post('/alerts', (req, res) => {
    try {
        const { route } = req.body;

        if (!route || !route.segments) {
            return res.status(400).json({ error: 'Valid route is required' });
        }

        // Check for disruptions affecting the route
        const alerts = [];

        // Simulate checking each segment
        route.segments.forEach(segment => {
            if (Math.random() < 0.2) { // 20% chance of alert
                alerts.push({
                    segmentId: segment.id,
                    type: 'delay',
                    severity: 'medium',
                    message: `Delays expected on ${segment.line || segment.mode}`,
                    delay: Math.floor(Math.random() * 10) + 3,
                    affectedSegment: `${segment.from} → ${segment.to}`
                });
            }
        });

        res.json({
            success: true,
            alerts,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get alerts', message: error.message });
    }
});

module.exports = router;