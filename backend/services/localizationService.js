const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

class LocalizationService {
    constructor() {
        this.available = ['en', 'hi', 'es', 'fr', 'ja'];

        i18next.use(Backend).init({
            lng: 'en',
            fallbackLng: 'en',
            preload: this.available,
            backend: {
                loadPath: path.join(__dirname, '..', 'locales', '{{lng}}.json')
            }
        }).then(() => {
            console.log('✅ i18next initialized');
        }).catch(err => console.error('i18n init err', err));
    }

    detectLanguageFromLocation({ countryCode }) {
        // Minimal heuristics: map country to language and currency
        const map = {
            IN: { lang: 'hi', currency: 'INR' },
            US: { lang: 'en', currency: 'USD' },
            GB: { lang: 'en', currency: 'GBP' },
            FR: { lang: 'fr', currency: 'EUR' },
            JP: { lang: 'ja', currency: 'JPY' }
        };

        return map[countryCode] || { lang: 'en', currency: 'USD' };
    }

    t(key, options) {
        return i18next.t(key, options);
    }
}

module.exports = new LocalizationService();
