const analyticsService = require('./analyticsService');

class CrowdPredictor {
    constructor() {
        // Placeholder model state; in production this would be a trained ML model
        this.trained = false;
    }

    train() {
        // Use analyticsService data to build simple heuristics (mock)
        // In real system: export training dataset and train time-series models here
        this.trained = true;
        console.log('✅ CrowdPredictor: trained (mock)');
    }

    // Predict crowd level for a given station/segment and datetime
    getPrediction({ station, hour, dayOfWeek, cityId }) {
        // Use historical congestion patterns to predict
        const patterns = analyticsService.getCongestionPatterns();
        const match = patterns.find(p => p.station === station);

        let score = 30; // base
        if (match) score = match.avgCongestion;

        // adjust by hour
        if (hour >= 8 && hour <= 10) score += 25;
        if (hour >= 17 && hour <= 20) score += 20;

        // clamp
        score = Math.min(100, Math.max(0, score));

        let level = 'low';
        if (score > 75) level = 'very_high';
        else if (score > 55) level = 'high';
        else if (score > 35) level = 'medium';

        return {
            station,
            predictedLevel: level,
            score,
            hour,
            dayOfWeek,
            cityId,
            generatedAt: new Date()
        };
    }
}

module.exports = new CrowdPredictor();
