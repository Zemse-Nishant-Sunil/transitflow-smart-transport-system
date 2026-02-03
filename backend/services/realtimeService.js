const mockData = require('../data/mockData');
const NodeCache = require('node-cache');

// Cache for active journeys and their real-time data
const journeyCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

class RealtimeService {
    constructor() {
        this.io = null;
        this.updateInterval = null;
    }

    initialize(io) {
        this.io = io;
        this.startRealtimeUpdates();
    }

    startRealtimeUpdates() {
        // Simulate real-time updates every 30 seconds
        this.updateInterval = setInterval(() => {
            this.generateRealtimeUpdates();
        }, 30000);

        console.log('✅ Real-time update service started');
    }

    generateRealtimeUpdates() {
        const activeJourneys = journeyCache.keys();

        activeJourneys.forEach(journeyId => {
            const journey = journeyCache.get(journeyId);
            if (!journey) return;

            // Random chance of disruption
            if (Math.random() < 0.15) { // 15% chance
                const disruption = this.simulateDisruption(journey);
                this.io.to(`journey_${journeyId}`).emit('disruption_alert', disruption);
            }

            // Update crowd levels
            const crowdUpdate = this.simulateCrowdUpdate(journey);
            this.io.to(`journey_${journeyId}`).emit('crowd_update', crowdUpdate);

            // Update vehicle positions
            const positionUpdate = this.simulateVehiclePosition(journey);
            this.io.to(`journey_${journeyId}`).emit('position_update', positionUpdate);
        });
    }

    simulateDisruption(journey) {
        const disruptions = mockData.commonDisruptions;
        const randomDisruption = disruptions[Math.floor(Math.random() * disruptions.length)];

        const affectedSegment = journey.segments[Math.floor(Math.random() * journey.segments.length)];

        return {
            id: `disruption_${Date.now()}`,
            journeyId: journey.id,
            segmentId: affectedSegment.id,
            type: randomDisruption.type,
            severity: randomDisruption.delay > 20 ? 'high' : randomDisruption.delay > 10 ? 'medium' : 'low',
            delay: randomDisruption.delay,
            affectedLine: affectedSegment.line || affectedSegment.mode,
            message: this.getDisruptionMessage(randomDisruption.type, affectedSegment),
            timestamp: new Date(),
            estimatedResolution: new Date(Date.now() + randomDisruption.delay * 60000),
            alternativesAvailable: true
        };
    }

    getDisruptionMessage(type, segment) {
        const messages = {
            signal_failure: `Signal failure on ${segment.line || segment.mode} between ${segment.from} and ${segment.to}. Delays expected.`,
            crowd: `Heavy crowd at ${segment.from}. Boarding may take longer than usual.`,
            technical_snag: `Technical issue reported on ${segment.line || segment.mode}. Services running with delays.`,
            weather: `Heavy rain affecting services on ${segment.line || segment.mode}. Please allow extra time.`,
            track_maintenance: `Emergency track maintenance between ${segment.from} and ${segment.to}. Expect delays.`
        };
        return messages[type] || 'Delay reported on this segment.';
    }

    simulateCrowdUpdate(journey) {
        return journey.segments.map(segment => {
            const crowdLevels = ['low', 'medium', 'high', 'very_high'];
            const currentHour = new Date().getHours();

            // Peak hours (8-10 AM, 6-9 PM) have higher crowd probability
            const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 18 && currentHour <= 21);

            let crowdLevel;
            if (isPeakHour) {
                crowdLevel = crowdLevels[Math.floor(Math.random() * 2) + 2]; // medium to very_high
            } else {
                crowdLevel = crowdLevels[Math.floor(Math.random() * 3)]; // low to high
            }

            return {
                segmentId: segment.id,
                from: segment.from,
                to: segment.to,
                crowdLevel: crowdLevel,
                estimatedSeats: crowdLevel === 'low' ? 'Available' : crowdLevel === 'medium' ? 'Limited' : 'None',
                timestamp: new Date()
            };
        });
    }

    simulateVehiclePosition(journey) {
        // Simulate vehicle moving along route
        const activeSegment = journey.segments.find(seg => {
            const now = new Date();
            return seg.departureTime <= now && seg.arrivalTime >= now;
        });

        if (!activeSegment) return null;

        const progress = Math.random() * 100; // 0-100% progress

        return {
            segmentId: activeSegment.id,
            mode: activeSegment.mode,
            line: activeSegment.line,
            currentPosition: progress,
            estimatedArrival: new Date(Date.now() + (100 - progress) * 60000 / 100 * activeSegment.duration),
            nextStop: activeSegment.to,
            delayMinutes: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
            timestamp: new Date()
        };
    }

    trackJourney(journeyId, journeyData) {
        journeyCache.set(journeyId, journeyData);
    }

    getJourneyStatus(journeyId) {
        return journeyCache.get(journeyId);
    }

    stopTracking(journeyId) {
        journeyCache.del(journeyId);
    }

    // Get real-time platform information
    getPlatformInfo(stationId, mode) {
        const platforms = [];
        const numPlatforms = Math.floor(Math.random() * 3) + 2; // 2-4 platforms

        for (let i = 1; i <= numPlatforms; i++) {
            platforms.push({
                platformNumber: i,
                nextArrival: new Date(Date.now() + Math.random() * 15 * 60000), // 0-15 min
                destination: Object.values(mockData.stations)[Math.floor(Math.random() * 10)].name,
                status: Math.random() > 0.2 ? 'on_time' : 'delayed',
                crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                delay: Math.random() > 0.8 ? Math.floor(Math.random() * 10) : 0
            });
        }

        return platforms.sort((a, b) => a.nextArrival - b.nextArrival);
    }

    // Get nearby vehicles
    getNearbyVehicles(lat, lng, mode, radius = 2) {
        const vehicles = [];
        const numVehicles = Math.floor(Math.random() * 5) + 1; // 1-5 vehicles

        for (let i = 0; i < numVehicles; i++) {
            const distance = Math.random() * radius;
            const eta = Math.round((distance / 0.5) * 60); // Assuming 30 km/h average

            vehicles.push({
                id: `vehicle_${mode}_${i}`,
                mode: mode,
                number: mode === 'bus' ? `${Math.floor(Math.random() * 400) + 1}` : null,
                distance: distance.toFixed(2),
                eta: eta,
                crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                lat: lat + (Math.random() - 0.5) * 0.02,
                lng: lng + (Math.random() - 0.5) * 0.02
            });
        }

        return vehicles.sort((a, b) => a.eta - b.eta);
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

module.exports = new RealtimeService();