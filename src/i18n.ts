import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import sv from './locales/sv.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import zhTW from './locales/zh-TW.json';

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
      de: {
        translation: de,
      },
      es: {
        translation: es,
      },
      fr: {
        translation: fr,
      },
      hi: {
        translation: hi,
      },
      id: {
        translation: id,
      },
      it: {
        translation: it,
      },
      ja: {
        translation: ja,
      },
      ko: {
        translation: ko,
      },
      pl: {
        translation: pl,
      },
      pt: {
        translation: pt,
      },
      ru: {
        translation: ru,
      },
      sv: {
        translation: sv,
      },
      tr: {
        translation: tr,
      },
      uk: {
        translation: uk,
      },
      'zh-TW': {
        translation: zhTW,
      },
    },
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
