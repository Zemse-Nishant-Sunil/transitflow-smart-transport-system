const axios = require('axios');

class ElectricityMapService {
    constructor() {
        this.base = process.env.ELECTRICITYMAP_URL || 'https://api.electricitymap.org/v3';
        this.apiKey = process.env.ELECTRICITYMAP_API_KEY || null; // optional
    }

    async latest(zone) {
        try {
            // zone can be country code or region identifier depending on API
            const url = `${this.base}/carbon-intensity/latest`;
            const params = {};
            if (zone) params.zone = zone;

            const headers = {};
            if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

            const resp = await axios.get(url, { params, headers });
            return resp.data;
        } catch (err) {
            console.warn('ElectricityMap error', err.message);
            return null;
        }
    }
}

module.exports = new ElectricityMapService();