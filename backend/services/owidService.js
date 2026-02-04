const axios = require('axios');
const NodeCache = require('node-cache');

// Cache the OWID dataset for an hour to avoid repeated large downloads
const dataCache = new NodeCache({ stdTTL: 3600 });

class OWIDService {
    constructor() {
        // Raw JSON/CSV from OWID repo; using CSV is sometimes easier but we fetch JSON if available
        this.source = process.env.OWID_CO2_SOURCE || 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json';
    }

    async _fetchAll() {
        const cached = dataCache.get('owid_all');
        if (cached) return cached;

        try {
            const resp = await axios.get(this.source);
            dataCache.set('owid_all', resp.data);
            return resp.data;
        } catch (err) {
            console.warn('OWID data fetch error', err.message);
            return null;
        }
    }

    // countryCode is ISO alpha-3 or alpha-2; OWID uses alpha-3 in many cases but entries include iso_code
    async getCountryLatest(countryCode) {
        const all = await this._fetchAll();
        if (!all) return null;

        // Find entry by iso_code (case-insensitive)
        const code = (countryCode || '').toUpperCase();
        const entries = Object.values(all);
        const match = entries.find(e => (e.iso_code || '').toUpperCase() === code || (e.iso_code || '').slice(0,2).toUpperCase() === code);
        if (!match) return null;

        // Find the latest year record inside match.data
        const dataPoints = match.data || [];
        const latest = dataPoints[dataPoints.length - 1] || null;

        return {
            country: match.country,
            iso_code: match.iso_code,
            latest
        };
    }
}

module.exports = new OWIDService();
