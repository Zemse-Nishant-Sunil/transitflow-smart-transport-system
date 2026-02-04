const axios = require('axios');

class FrankfurterService {
    constructor() {
        this.base = process.env.FRANKFURTER_URL || 'https://api.frankfurter.app';
    }

    async convert(amount = 1, from = 'USD', to = 'EUR') {
        try {
            const resp = await axios.get(`${this.base}/latest`, { params: { amount, from, to } });
            return resp.data;
        } catch (err) {
            console.warn('Frankfurter error', err.message);
            return null;
        }
    }
}

module.exports = new FrankfurterService();
