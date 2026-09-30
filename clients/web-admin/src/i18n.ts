import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from '@shared/i18n/translations.json';

const resources: Record<string, { translation: any }> = {};
for (const [lang, data] of Object.entries(translations)) {
  resources[lang] = { translation: data };
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;