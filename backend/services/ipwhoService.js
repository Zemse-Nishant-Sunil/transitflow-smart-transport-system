const axios = require('axios');

class IPWhoService {
    constructor() {
        this.base = process.env.IPWHO_URL || 'https://ipwho.is';
    }

    async lookup(ip) {
        try {
            const url = ip ? `${this.base}/${ip}` : `${this.base}/`;
            const resp = await axios.get(url);
            return resp.data;
        } catch (err) {
            console.warn('ipwho lookup error', err.message);
            return null;
        }
    }
}

module.exports = new IPWhoService();
