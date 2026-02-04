const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

class GtfsRealtimeService {
    constructor() {
        this.feedUrls = {}; // cityId -> url
        this.pollInterval = 20000; // 20s
        this.timers = {};
    }

    registerFeed(cityId, feedUrl, io) {
        this.feedUrls[cityId] = { url: feedUrl, io };
        this._startPolling(cityId);
    }

    unregisterFeed(cityId) {
        if (this.timers[cityId]) clearInterval(this.timers[cityId]);
        delete this.feedUrls[cityId];
    }

    _startPolling(cityId) {
        if (!this.feedUrls[cityId]) return;
        if (this.timers[cityId]) clearInterval(this.timers[cityId]);

        const poll = async () => {
            try {
                const { url, io } = this.feedUrls[cityId];
                const resp = await axios.get(url, { responseType: 'arraybuffer' });
                const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(resp.data));

                feed.entity.forEach(entity => {
                    // Example: trip update or vehicle positions
                    if (entity.vehicle && io) {
                        io.emit('gtfs_vehicle_position', {
                            cityId,
                            vehicle: entity.vehicle
                        });
                    }
                    if (entity.trip_update && io) {
                        io.emit('gtfs_trip_update', {
                            cityId,
                            tripUpdate: entity.trip_update
                        });
                    }
                });
            } catch (err) {
                console.warn('GTFS-RT poll error for', cityId, err.message);
            }
        };

        // initial poll
        poll();
        this.timers[cityId] = setInterval(poll, this.pollInterval);
    }
}

module.exports = new GtfsRealtimeService();
