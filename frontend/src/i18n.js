import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: 'TransitFlow',
      planJourney: 'Plan Your Journey',
      findRoutes: 'Find Routes'
    }
  },
  hi: {
    translation: {
      appTitle: 'ट्रांज़िटफ़्लो',
      planJourney: 'अपनी यात्रा योजना बनाएं',
      findRoutes: 'रूट खोजें'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;