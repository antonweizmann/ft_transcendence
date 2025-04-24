import { LoadDataFromBackend } from "./profile.js";

window.changeLanguage = changeLanguage;
export {
	changeLanguage
};

function changeLanguage(event) {
	const selectedLanguage = event ? event.target.value : localStorage.getItem('language') || 'en';
	const languageDropdown = document.getElementById('languageDropdown');

	if (languageDropdown) {
		languageDropdown.value = selectedLanguage; // Set the dropdown to the selected language
	}
	localStorage.setItem('language', selectedLanguage);
	loadTranslations(selectedLanguage);
}

function loadTranslations(language) {
	LoadDataFromBackend(`/translations/index/${language}.json`, applyTranslations);
	LoadDataFromBackend(`/translations${window.location.pathname}/${language}.json`, applyTranslations);
}

function applyTranslations(translations) {
	document.querySelectorAll('[data-translate]').forEach(element => {
		const translationKey = element.getAttribute('data-translate');

		if (translations[translationKey]) {
			if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
				element.setAttribute('placeholder', translations[translationKey]);
			} else {
				element.textContent = translations[translationKey];
			}
		}
	});
}