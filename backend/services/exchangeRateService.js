const axios = require('axios');

class ExchangeRateService {
    constructor() {
        this.base = process.env.EXCHANGERATE_API_URL || 'https://api.exchangerate.host';
    }

    async convert(amount, from, to) {
        try {
            const resp = await axios.get(`${this.base}/convert`, { params: { from, to, amount } });
            return resp.data;
        } catch (err) {
            console.warn('Exchange rate lookup error', err.message);
            return null;
        }
    }

    async rates(base = 'USD') {
        try {
            const resp = await axios.get(`${this.base}/latest`, { params: { base } });
            return resp.data;
        } catch (err) {
            console.warn('Exchange rates error', err.message);
            return null;
        }
    }
}

module.exports = new ExchangeRateService();