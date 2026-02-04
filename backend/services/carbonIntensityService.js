const axios = require('axios');

class CarbonIntensityService {
    constructor() {
        this.apiKey = process.env.CO2SIGNAL_API_KEY;
        this.base = 'https://api.co2signal.com/v1/latest';
    }

    async getIntensity(countryCode) {
        if (!this.apiKey) return null;
        try {
            const resp = await axios.get(`${this.base}`, { params: { countryCode }, headers: { 'auth-token': this.apiKey } });
            return resp.data;
        } catch (err) {
            console.warn('CO2Signal error', err.message);
            return null;
        }
    }
}

module.exports = new CarbonIntensityService();