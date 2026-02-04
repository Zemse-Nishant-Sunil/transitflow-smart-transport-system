const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { parse } = require('csv-parse/sync');
const NodeCache = require('node-cache');
const geolib = require('geolib');

// Cache feeds by cityId
const feedCache = new NodeCache({ stdTTL: 24 * 3600 }); // 1 day

class GTFSService {
    constructor() {
        this.feeds = {}; // { cityId: { stops: {}, routes: {}, trips: {} } }
    }

    // Load a GTFS .zip from disk (or you can extend to download remote zips)
    async loadGtfsZip(cityId, zipFilePath) {
        if (!cityId || !zipFilePath) throw new Error('cityId and zipFilePath required');

        const extractDir = path.join(__dirname, '..', 'data', 'gtfs', cityId);
        await fs.promises.mkdir(extractDir, { recursive: true });

        await fs.createReadStream(zipFilePath)
            .pipe(unzipper.Extract({ path: extractDir }))
            .promise();

        // Parse core files
        const stopsCsv = await this._readCsv(path.join(extractDir, 'stops.txt'));
        const routesCsv = await this._readCsv(path.join(extractDir, 'routes.txt'));
        const tripsCsv = await this._readCsv(path.join(extractDir, 'trips.txt'));
        const stopTimesCsv = await this._readCsv(path.join(extractDir, 'stop_times.txt'));

        const stops = {};
        stopsCsv.forEach(s => {
            stops[s.stop_id] = {
                id: s.stop_id,
                name: s.stop_name,
                lat: parseFloat(s.stop_lat),
                lng: parseFloat(s.stop_lon),
                zone: s.zone_id || null
            };
        });

        const routes = {};
        routesCsv.forEach(r => {
            routes[r.route_id] = {
                id: r.route_id,
                shortName: r.route_short_name || r.route_id,
                longName: r.route_long_name,
                mode: r.route_type || 'unknown'
            };
        });

        const trips = {};
        tripsCsv.forEach(t => {
            trips[t.trip_id] = {
                id: t.trip_id,
                routeId: t.route_id,
                serviceId: t.service_id
            };
        });

        // group stop-times by trip
        const stopTimesByTrip = {};
        stopTimesCsv.forEach(st => {
            if (!stopTimesByTrip[st.trip_id]) stopTimesByTrip[st.trip_id] = [];
            stopTimesByTrip[st.trip_id].push(st);
        });

        // attach stops sequence to trips
        Object.keys(stopTimesByTrip).forEach(tripId => {
            const seq = stopTimesByTrip[tripId]
                .sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence))
                .map(st => ({ stopId: st.stop_id, arrival: st.arrival_time, departure: st.departure_time }));
            if (trips[tripId]) trips[tripId].stops = seq;
        });

        this.feeds[cityId] = { stops, routes, trips };
        feedCache.set(cityId, { stops, routes, trips });

        return this.feeds[cityId];
    }

    async _readCsv(filePath) {
        try {
            const raw = await fs.promises.readFile(filePath, 'utf8');
            return parse(raw, {
                columns: true,
                skip_empty_lines: true
            });
        } catch (err) {
            return [];
        }
    }

    getStops(cityId) {
        const feed = this.feeds[cityId] || feedCache.get(cityId);
        return feed ? feed.stops : {};
    }

    getRoutes(cityId) {
        const feed = this.feeds[cityId] || feedCache.get(cityId);
        return feed ? feed.routes : {};
    }

    findNearestStop(cityId, lat, lng) {
        const stops = Object.values(this.getStops(cityId));
        if (!stops.length) return null;
        const nearest = geolib.findNearest({ latitude: lat, longitude: lng },
            stops.map(s => ({ latitude: s.lat, longitude: s.lng, ...s })));
        return nearest;
    }

    listFeeds() {
        return Object.keys(this.feeds);
    }
}

module.exports = new GTFSService();
