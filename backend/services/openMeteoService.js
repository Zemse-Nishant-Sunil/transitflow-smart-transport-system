const axios = require('axios');

class OpenMeteoService {
    constructor() {
        this.base = process.env.OPENMETEO_URL || 'https://api.open-meteo.com/v1/forecast';
    }

    async current(lat, lon) {
        try {
            const resp = await axios.get(this.base, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current_weather: true,
                    timezone: 'auto'
                }
            });
            return resp.data;
        } catch (err) {
            console.warn('OpenMeteo error', err.message);
            return null;
        }
    }
}

module.exports = new OpenMeteoService();
