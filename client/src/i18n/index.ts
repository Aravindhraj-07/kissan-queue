import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';
import hiTranslation from './locales/hi.json';

const savedLanguage = localStorage.getItem('procurex_lang') || 'en';

const resources = {
  en: {
    translation: enTranslation,
  },
  ta: {
    translation: taTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already safely escapes values
  },
});

export const changeLanguage = (lang: 'en' | 'ta' | 'hi') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('procurex_lang', lang);
  document.documentElement.lang = lang;
};

export default i18n;
