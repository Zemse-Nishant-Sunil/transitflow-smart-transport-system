const axios = require('axios');

class GeocodeService {
    constructor() {
        this.nominatimUrl = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
    }

    async reverse(lat, lon) {
        try {
            const resp = await axios.get(`${this.nominatimUrl}/reverse`, {
                params: { format: 'jsonv2', lat, lon }
            });
            return resp.data;
        } catch (err) {
            console.warn('Nominatim reverse error', err.message);
            return null;
        }
    }

    async forward(q) {
        try {
            const resp = await axios.get(`${this.nominatimUrl}/search`, {
                params: { format: 'jsonv2', q }
            });
            return resp.data;
        } catch (err) {
            console.warn('Nominatim search error', err.message);
            return [];
        }
    }
}

module.exports = new GeocodeService();
