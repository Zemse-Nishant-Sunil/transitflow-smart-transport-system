const axios = require('axios');

class OSRMService {
    constructor() {
        // Default to the public demo server; for production self-host an OSRM instance
        this.base = process.env.OSRM_URL || 'https://router.project-osrm.org';
    }

    // profile: driving | foot | bike | driving-traffic (depends on server)
    async route(startLat, startLon, endLat, endLon, profile = 'driving') {
        try {
            const coords = `${startLon},${startLat};${endLon},${endLat}`;
            const url = `${this.base}/route/v1/${profile}/${coords}`;
            const resp = await axios.get(url, {
                params: { overview: 'false', alternatives: false, steps: false }
            });
            if (resp.data && resp.data.code === 'Ok' && resp.data.routes && resp.data.routes.length) {
                return resp.data.routes[0];
            }
            return null;
        } catch (err) {
            console.warn('OSRM route error', err.message);
            return null;
        }
    }
}

module.exports = new OSRMService();
