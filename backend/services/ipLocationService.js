const axios = require('axios');

class IPLocationService {
    constructor() {
        this.base = process.env.IPAPI_URL || 'https://ipapi.co';
    }

    async lookup(ip) {
        try {
            const url = ip ? `${this.base}/${ip}/json/` : `${this.base}/json/`;
            const resp = await axios.get(url);
            return resp.data;
        } catch (err) {
            console.warn('ipapi lookup error', err.message);
            return null;
        }
    }
}

module.exports = new IPLocationService();