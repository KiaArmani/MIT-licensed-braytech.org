import * as ls from './localStorage';
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import backend from 'i18next-xhr-backend';

let _defaultLanguage = 'en';
let _currentLanguage;

function getCurrentLanguage() {
  if (_currentLanguage) return _currentLanguage;
  _currentLanguage = ls.get('setting.language');
  return _currentLanguage || _defaultLanguage;
}

function setCurrentLanguage(lang) {
  _currentLanguage = lang;
  ls.set('setting.language', lang);
}

i18n
  .use(backend)
  .use(reactI18nextModule)
  .init({
    lng: getCurrentLanguage(),
    fallbackLng: _defaultLanguage,

    backend: {
      loadPath: '/static/locales/{{lng}}/{{ns}}.json'
    },

    // allow keys to be phrases having `:`, `.`
    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false
    },
    react: {
      wait: true
    }
  });

i18n.getCurrentLanguage = getCurrentLanguage;
i18n.setCurrentLanguage = setCurrentLanguage;

export default i18n;
