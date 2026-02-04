const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.base = 'https://api.openweathermap.org/data/2.5';
    }

    async current(lat, lon) {
        if (!this.apiKey) return null;
        try {
            const resp = await axios.get(`${this.base}/weather`, { params: { lat, lon, appid: this.apiKey, units: 'metric' } });
            return resp.data;
        } catch (err) {
            console.warn('OpenWeather error', err.message);
            return null;
        }
    }
}

module.exports = new WeatherService();