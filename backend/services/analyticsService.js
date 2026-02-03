const NodeCache = require('node-cache');

// Analytics cache
const analyticsCache = new NodeCache({ stdTTL: 86400 }); // 24 hours TTL

class AnalyticsService {
    constructor() {
        this.journeyLogs = [];
        this.disruptionLogs = [];
        this.congestionData = [];
        this.initializeMockAnalytics();
    }

    initializeMockAnalytics() {
        // Generate mock historical data
        this.generateMockJourneyData();
        this.generateMockDisruptionData();
        this.generateMockCongestionData();
    }

    generateMockJourneyData() {
        const routes = [
            { from: 'Bhayandar', to: 'Churchgate', popular: true },
            { from: 'Andheri', to: 'CSMT', popular: true },
            { from: 'Thane', to: 'Dadar', popular: true },
            { from: 'Borivali', to: 'Lower Parel', popular: false },
            { from: 'Bandra', to: 'Ghatkopar', popular: false }
        ];

        const hours = ['06', '07', '08', '09', '10', '17', '18', '19', '20', '21'];

        routes.forEach(route => {
            hours.forEach(hour => {
                const baseCount = route.popular ? 500 : 200;
                const peakMultiplier = (hour >= '08' && hour <= '10') || (hour >= '18' && hour <= '20') ? 2 : 1;

                this.journeyLogs.push({
                    route: `${route.from} → ${route.to}`,
                    hour: parseInt(hour),
                    count: Math.floor(baseCount * peakMultiplier * (0.8 + Math.random() * 0.4)),
                    avgDuration: 45 + Math.floor(Math.random() * 30),
                    avgCost: 30 + Math.floor(Math.random() * 40),
                    date: new Date()
                });
            });
        });
    }

    generateMockDisruptionData() {
        const lines = ['Western Line', 'Central Line', 'Metro Line 1'];
        const types = ['signal_failure', 'crowd', 'technical_snag', 'weather', 'track_maintenance'];

        for (let i = 0; i < 50; i++) {
            const line = lines[Math.floor(Math.random() * lines.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const hour = Math.floor(Math.random() * 24);
            const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21);

            this.disruptionLogs.push({
                id: `disruption_${i}`,
                line: line,
                type: type,
                hour: hour,
                duration: Math.floor(Math.random() * 45) + 5,
                affectedCommuters: isPeakHour ? Math.floor(Math.random() * 5000) + 2000 : Math.floor(Math.random() * 1000) + 500,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
            });
        }
    }

    generateMockCongestionData() {
        const stations = ['Dadar', 'Andheri', 'Churchgate', 'CSMT', 'Bandra', 'Thane', 'Borivali'];
        const hours = Array.from({ length: 24 }, (_, i) => i);

        stations.forEach(station => {
            hours.forEach(hour => {
                const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21);
                const baseLevel = isPeakHour ? 70 : 30;

                this.congestionData.push({
                    station: station,
                    hour: hour,
                    congestionLevel: Math.min(100, baseLevel + Math.floor(Math.random() * 30)),
                    avgWaitTime: isPeakHour ? 8 + Math.floor(Math.random() * 7) : 3 + Math.floor(Math.random() * 4),
                    platformUtilization: isPeakHour ? 85 + Math.floor(Math.random() * 15) : 40 + Math.floor(Math.random() * 30)
                });
            });
        });
    }

    logJourney(journeyData) {
        this.journeyLogs.push({
            ...journeyData,
            timestamp: new Date()
        });
    }

    logDisruption(disruptionData) {
        this.disruptionLogs.push({
            ...disruptionData,
            timestamp: new Date()
        });
    }

    getPopularRoutes(limit = 10) {
        const routeCounts = {};

        this.journeyLogs.forEach(log => {
            if (!routeCounts[log.route]) {
                routeCounts[log.route] = {
                    route: log.route,
                    totalJourneys: 0,
                    avgDuration: 0,
                    avgCost: 0,
                    peakHours: []
                };
            }

            routeCounts[log.route].totalJourneys += log.count;
            routeCounts[log.route].avgDuration += log.avgDuration * log.count;
            routeCounts[log.route].avgCost += log.avgCost * log.count;
        });

        // Calculate averages
        Object.values(routeCounts).forEach(route => {
            route.avgDuration = Math.round(route.avgDuration / route.totalJourneys);
            route.avgCost = Math.round(route.avgCost / route.totalJourneys);

            // Find peak hours
            const hourlyData = this.journeyLogs
                .filter(log => log.route === route.route)
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            route.peakHours = hourlyData.map(d => `${d.hour}:00`);
        });

        return Object.values(routeCounts)
            .sort((a, b) => b.totalJourneys - a.totalJourneys)
            .slice(0, limit);
    }

    getDisruptionHotspots() {
        const lineCounts = {};

        this.disruptionLogs.forEach(log => {
            if (!lineCounts[log.line]) {
                lineCounts[log.line] = {
                    line: log.line,
                    totalDisruptions: 0,
                    avgDuration: 0,
                    totalAffectedCommuters: 0,
                    commonTypes: {}
                };
            }

            lineCounts[log.line].totalDisruptions += 1;
            lineCounts[log.line].avgDuration += log.duration;
            lineCounts[log.line].totalAffectedCommuters += log.affectedCommuters;

            if (!lineCounts[log.line].commonTypes[log.type]) {
                lineCounts[log.line].commonTypes[log.type] = 0;
            }
            lineCounts[log.line].commonTypes[log.type] += 1;
        });

        // Calculate averages and find most common type
        Object.values(lineCounts).forEach(line => {
            line.avgDuration = Math.round(line.avgDuration / line.totalDisruptions);

            const mostCommonType = Object.entries(line.commonTypes)
                .sort((a, b) => b[1] - a[1])[0];

            line.mostCommonType = mostCommonType[0];
            line.typeCount = mostCommonType[1];
            delete line.commonTypes;
        });

        return Object.values(lineCounts)
            .sort((a, b) => b.totalDisruptions - a.totalDisruptions);
    }

    getCongestionPatterns() {
        const stationPatterns = {};

        this.congestionData.forEach(data => {
            if (!stationPatterns[data.station]) {
                stationPatterns[data.station] = {
                    station: data.station,
                    peakHours: [],
                    avgCongestion: 0,
                    maxCongestion: 0,
                    avgWaitTime: 0
                };
            }

            const pattern = stationPatterns[data.station];
            pattern.avgCongestion += data.congestionLevel;
            pattern.maxCongestion = Math.max(pattern.maxCongestion, data.congestionLevel);
            pattern.avgWaitTime += data.avgWaitTime;

            if (data.congestionLevel > 70) {
                pattern.peakHours.push({
                    hour: data.hour,
                    level: data.congestionLevel
                });
            }
        });

        // Calculate averages
        Object.values(stationPatterns).forEach(pattern => {
            const dataPoints = this.congestionData.filter(d => d.station === pattern.station).length;
            pattern.avgCongestion = Math.round(pattern.avgCongestion / dataPoints);
            pattern.avgWaitTime = Math.round(pattern.avgWaitTime / dataPoints);
            pattern.peakHours = pattern.peakHours
                .sort((a, b) => b.level - a.level)
                .slice(0, 5)
                .map(p => `${p.hour}:00`);
        });

        return Object.values(stationPatterns)
            .sort((a, b) => b.avgCongestion - a.avgCongestion);
    }

    getTimeSeriesData(metric, period = '7d') {
        // Generate time series data for visualizations
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 1;
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            let value;
            switch (metric) {
                case 'total_journeys':
                    value = Math.floor(Math.random() * 50000) + 80000;
                    break;
                case 'disruptions':
                    value = Math.floor(Math.random() * 20) + 5;
                    break;
                case 'avg_delay':
                    value = Math.floor(Math.random() * 10) + 3;
                    break;
                case 'satisfaction':
                    value = (Math.random() * 20 + 70).toFixed(1);
                    break;
                default:
                    value = 0;
            }

            data.push({
                date: date.toISOString().split('T')[0],
                value: value
            });
        }

        return data;
    }

    getRecommendations() {
        const recommendations = [
            {
                id: 'rec_1',
                priority: 'high',
                category: 'infrastructure',
                title: 'Increase frequency on Western Line during peak hours',
                description: 'Analysis shows 40% overcrowding on Western Line between 8-10 AM. Recommend adding 2 additional trains.',
                estimatedImpact: '15% reduction in crowd levels',
                affectedRoutes: ['Churchgate → Borivali', 'Bhayandar → Mumbai Central'],
                estimatedCost: '₹5-7 Cr/year',
                implementationTime: '2-3 months'
            },
            {
                id: 'rec_2',
                priority: 'medium',
                category: 'operations',
                title: 'Optimize signal timing at Dadar junction',
                description: 'Dadar experiences 25% of all signal-related delays. Upgrading to modern signaling can reduce delays by 60%.',
                estimatedImpact: '8-minute average reduction in journey time',
                affectedRoutes: ['All routes via Dadar'],
                estimatedCost: '₹12-15 Cr',
                implementationTime: '6-8 months'
            },
            {
                id: 'rec_3',
                priority: 'high',
                category: 'customer_experience',
                title: 'Improve transfer infrastructure at Andheri',
                description: 'Transfer time between local train and metro averages 8 minutes. Adding dedicated walkway can reduce to 3 minutes.',
                estimatedImpact: '62% faster transfers',
                affectedRoutes: ['Western Line ↔ Metro Line 1'],
                estimatedCost: '₹3-4 Cr',
                implementationTime: '3-4 months'
            },
            {
                id: 'rec_4',
                priority: 'low',
                category: 'technology',
                title: 'Deploy real-time crowd monitoring sensors',
                description: 'Install sensors at top 10 busiest stations to provide live crowd data to commuters.',
                estimatedImpact: 'Better journey planning, 20% more even distribution',
                affectedRoutes: ['All major stations'],
                estimatedCost: '₹2-3 Cr',
                implementationTime: '2-3 months'
            }
        ];

        return recommendations;
    }

    getSystemHealthMetrics() {
        return {
            overallHealth: 78, // out of 100
            onTimePerformance: 82,
            customerSatisfaction: 71,
            systemUtilization: 87,
            incidentRate: 3.2, // per 1000 journeys
            avgDelay: 6.5, // minutes
            metrics: {
                totalJourneys24h: 127453,
                activeDisruptions: 3,
                avgJourneyTime: 48, // minutes
                peakCrowdLevel: 92, // percentage
                availableCapacity: 15 // percentage
            },
            lastUpdated: new Date()
        };
    }
}

module.exports = new AnalyticsService();