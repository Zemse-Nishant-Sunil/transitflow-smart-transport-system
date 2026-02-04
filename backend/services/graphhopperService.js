const axios = require('axios');

class GraphHopperService {
    constructor() {
        this.base = process.env.GRAPHOPPER_URL || 'https://graphhopper.com/api/1';
        this.apiKey = process.env.GRAPHOPPER_API_KEY || null; // many demo endpoints don't require a key
    }

    // simple route call using routing endpoint
    async route(startLat, startLon, endLat, endLon, profile = 'car') {
        try {
            const url = `${this.base}/route`;
            const params = {
                point: [`${startLat},${startLon}`, `${endLat},${endLon}`],
                vehicle: profile,
                points_encoded: false
            };
            if (this.apiKey) params.key = this.apiKey;

            const resp = await axios.get(url, { params: params });
            return resp.data;
        } catch (err) {
            console.warn('GraphHopper route error', err.message);
            return null;
        }
    }
}

module.exports = new GraphHopperService();