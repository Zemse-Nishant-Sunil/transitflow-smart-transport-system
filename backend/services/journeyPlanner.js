const mockData = require('../data/mockData');
const { v4: uuidv4 } = require('uuid');

class JourneyPlanner {
    constructor() {
        this.stations = mockData.stations;
        this.routes = mockData.routes;
    }

    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Find nearest station to coordinates
    findNearestStation(lat, lng, modeFilter = null) {
        let nearest = null;
        let minDistance = Infinity;

        Object.values(this.stations).forEach(station => {
            if (modeFilter && !station.modes.includes(modeFilter)) return;

            const distance = this.calculateDistance(lat, lng, station.lat, station.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = station;
            }
        });

        return { station: nearest, distance: minDistance };
    }

    // Plan multi-modal journey
    planJourney(origin, destination, preferences = {}) {
        const {
            departureTime = new Date(),
            avoidModes = [],
            preferFast = true,
            maxWalkingDistance = 1.5 // km
        } = preferences;

        // Find start and end stations
        const startPoint = this.findNearestStation(origin.lat, origin.lng);
        const endPoint = this.findNearestStation(destination.lat, destination.lng);

        // Generate multiple route options
        const routes = [];

        // Option 1: Direct train route if possible
        const trainRoute = this.findTrainRoute(startPoint.station, endPoint.station, avoidModes);
        if (trainRoute) {
            routes.push(trainRoute);
        }

        // Option 2: Train + Metro combination
        const multiModalRoute = this.findMultiModalRoute(startPoint.station, endPoint.station, avoidModes);
        if (multiModalRoute) {
            routes.push(multiModalRoute);
        }

        // Option 3: Bus-heavy route
        if (!avoidModes.includes('bus')) {
            const busRoute = this.findBusRoute(startPoint.station, endPoint.station);
            routes.push(busRoute);
        }

        // Add walking segments at start/end
        routes.forEach(route => {
            if (startPoint.distance > 0.1) {
                route.segments.unshift({
                    id: uuidv4(),
                    mode: 'walk',
                    from: 'Origin',
                    to: startPoint.station.name,
                    distance: startPoint.distance,
                    duration: Math.round((startPoint.distance / this.routes.walk.avgSpeed) * 60),
                    instructions: `Walk to ${startPoint.station.name} station`
                });
            }

            if (endPoint.distance > 0.1) {
                route.segments.push({
                    id: uuidv4(),
                    mode: 'walk',
                    from: endPoint.station.name,
                    to: 'Destination',
                    distance: endPoint.distance,
                    duration: Math.round((endPoint.distance / this.routes.walk.avgSpeed) * 60),
                    instructions: `Walk to destination from ${endPoint.station.name} station`
                });
            }
        });

        // Calculate totals and sort
        routes.forEach(route => {
            route.totalDuration = route.segments.reduce((sum, seg) => sum + seg.duration, 0);
            route.totalCost = route.segments.reduce((sum, seg) => sum + (seg.cost || 0), 0);
            route.totalDistance = route.segments.reduce((sum, seg) => sum + seg.distance, 0);
            route.transfers = route.segments.filter(seg => seg.isTransfer).length;
            route.id = uuidv4();
            route.createdAt = departureTime;
        });

        // Sort by preference
        routes.sort((a, b) => {
            if (preferFast) {
                return a.totalDuration - b.totalDuration;
            }
            return a.totalCost - b.totalCost;
        });

        return routes;
    }

    findTrainRoute(startStation, endStation, avoidModes) {
        if (avoidModes.includes('local_train')) return null;

        const segments = [];
        let currentStation = startStation;
        let found = false;

        // Check Western Line
        Object.values(this.routes.local_train).forEach(line => {
            const startIdx = line.stations.indexOf(startStation.id);
            const endIdx = line.stations.indexOf(endStation.id);

            if (startIdx !== -1 && endIdx !== -1) {
                const stationsInRoute = line.stations.slice(
                    Math.min(startIdx, endIdx),
                    Math.max(startIdx, endIdx) + 1
                );

                const distance = stationsInRoute.length * 2; // Approximate 2km between stations
                const duration = Math.round((distance / line.avgSpeed) * 60);

                segments.push({
                    id: uuidv4(),
                    mode: 'local_train',
                    line: line.name,
                    from: startStation.name,
                    to: endStation.name,
                    distance: distance,
                    duration: duration,
                    cost: line.cost + Math.floor(distance / 5) * 5,
                    stations: stationsInRoute.length,
                    departureTime: new Date(Date.now() + 5 * 60000), // 5 min wait
                    arrivalTime: new Date(Date.now() + (5 + duration) * 60000),
                    instructions: `Take ${line.name} from ${startStation.name} to ${endStation.name}`,
                    platformInfo: `Platform ${Math.floor(Math.random() * 4) + 1}`,
                    crowdLevel: Math.random() > 0.5 ? 'high' : 'medium'
                });
                found = true;
            }
        });

        if (!found) return null;

        return {
            segments,
            type: 'direct_train',
            reliability: 0.85
        };
    }

    findMultiModalRoute(startStation, endStation, avoidModes) {
        const segments = [];

        // Example: Train to major hub, then metro
        if (!avoidModes.includes('local_train') && !avoidModes.includes('metro')) {
            const hub = this.stations['andheri']; // Major transfer point

            // Train segment
            const trainDistance = 15;
            const trainDuration = Math.round((trainDistance / this.routes.local_train.western_line.avgSpeed) * 60);

            segments.push({
                id: uuidv4(),
                mode: 'local_train',
                line: 'Western Line',
                from: startStation.name,
                to: hub.name,
                distance: trainDistance,
                duration: trainDuration,
                cost: 20,
                stations: 8,
                departureTime: new Date(Date.now() + 5 * 60000),
                arrivalTime: new Date(Date.now() + (5 + trainDuration) * 60000),
                instructions: `Take Western Line to ${hub.name}`,
                platformInfo: 'Platform 2',
                crowdLevel: 'medium'
            });

            // Transfer
            segments.push({
                id: uuidv4(),
                mode: 'walk',
                from: hub.name,
                to: hub.name + ' Metro',
                distance: 0.2,
                duration: 5,
                cost: 0,
                isTransfer: true,
                instructions: 'Walk to Metro station (3 min)',
                transferInfo: {
                    walkingTime: 5,
                    signage: 'Follow Metro signs',
                    accessibility: 'Elevator available'
                }
            });

            // Metro segment
            const metroDistance = 10;
            const metroDuration = Math.round((metroDistance / this.routes.metro.line1.avgSpeed) * 60);

            segments.push({
                id: uuidv4(),
                mode: 'metro',
                line: 'Metro Line 1',
                from: hub.name,
                to: endStation.name,
                distance: metroDistance,
                duration: metroDuration,
                cost: 30,
                stations: 5,
                departureTime: new Date(Date.now() + (5 + trainDuration + 8) * 60000),
                arrivalTime: new Date(Date.now() + (5 + trainDuration + 8 + metroDuration) * 60000),
                instructions: `Take Metro Line 1 to ${endStation.name}`,
                platformInfo: 'Platform 1',
                crowdLevel: 'low'
            });
        }

        return segments.length > 0 ? { segments, type: 'multi_modal', reliability: 0.78 } : null;
    }

    findBusRoute(startStation, endStation) {
        const distance = this.calculateDistance(
            startStation.lat, startStation.lng,
            endStation.lat, endStation.lng
        );

        const duration = Math.round((distance / this.routes.bus.avgSpeed) * 60);
        const cost = this.routes.bus.baseCost + Math.floor(distance / 3) * 5;

        return {
            segments: [{
                id: uuidv4(),
                mode: 'bus',
                line: `Bus ${Math.floor(Math.random() * 400) + 1}`,
                from: startStation.name,
                to: endStation.name,
                distance: distance,
                duration: duration,
                cost: cost,
                departureTime: new Date(Date.now() + 10 * 60000),
                arrivalTime: new Date(Date.now() + (10 + duration) * 60000),
                instructions: `Take bus to ${endStation.name}`,
                stops: Math.floor(distance / 0.5),
                crowdLevel: 'medium',
                busNumber: `${Math.floor(Math.random() * 400) + 1}`
            }],
            type: 'bus_route',
            reliability: 0.65
        };
    }

    // Generate alternative routes in case of disruption
    generateAlternatives(originalRoute, disruptedSegment) {
        const alternatives = [];

        // Alternative 1: Same mode, different timing
        alternatives.push({
            ...originalRoute,
            id: uuidv4(),
            segments: originalRoute.segments.map(seg => {
                if (seg.id === disruptedSegment.id) {
                    return {
                        ...seg,
                        departureTime: new Date(seg.departureTime.getTime() + 15 * 60000),
                        arrivalTime: new Date(seg.arrivalTime.getTime() + 15 * 60000),
                        delay: 15,
                        reason: 'Wait for next service'
                    };
                }
                return seg;
            }),
            isAlternative: true,
            alternativeReason: 'Next available service'
        });

        // Alternative 2: Different mode if possible
        if (disruptedSegment.mode === 'local_train') {
            const autoReplacement = {
                ...originalRoute,
                id: uuidv4(),
                segments: originalRoute.segments.map(seg => {
                    if (seg.id === disruptedSegment.id) {
                        const distance = seg.distance;
                        return {
                            id: uuidv4(),
                            mode: 'auto',
                            from: seg.from,
                            to: seg.to,
                            distance: distance,
                            duration: Math.round((distance / this.routes.auto.avgSpeed) * 60),
                            cost: this.routes.auto.baseCost + (distance * this.routes.auto.perKmCost),
                            departureTime: new Date(Date.now() + 2 * 60000),
                            instructions: `Take auto-rickshaw to ${seg.to}`,
                            estimatedFare: this.routes.auto.baseCost + (distance * this.routes.auto.perKmCost)
                        };
                    }
                    return seg;
                }),
                isAlternative: true,
                alternativeReason: 'Auto-rickshaw replacement'
            };
            alternatives.push(autoReplacement);
        }

        return alternatives;
    }
}

module.exports = new JourneyPlanner();