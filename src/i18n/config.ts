import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './en.json';
import translationZh from './zh.json';


const resources = {
	'en': {
		translation: translationEn
	},
	'zh-CN': {
		translation: translationZh
	}
};
let lang = navigator.language;


// if (lang === 'zh-CN' || lang === 'zh') {
// 	lang = 'zh-CN';
// 	localStorage.setItem('language', 'zh-CN');
// } else {
// 	lang = 'en';
// 	localStorage.setItem('language', 'en');
// }
lang = 'en';

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		// fallbackLng: lang,
		lng: lang,
		debug: false,
		interpolation: {
			escapeValue: false
		}
		// detection: {
		// 	caches: ['localStorage', 'sessionStorage', 'cookie']
		// }
	});

export default i18n;
