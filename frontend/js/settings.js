import { getCookie } from "./utils.js";
import { LoadDataFromBackend } from "./profile.js";

export {
	initSettings
}

function initSettings() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadSettings();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadSettings);
	}
}

function loadSettings() {
	const userId = getCookie('user_id');
	LoadDataFromBackend(`/api/player/${userId}/`, setSettingsData);
}

function setSettingsData(data) {
	const profile_pic = document.getElementById('previewImage');
	const username = document.getElementById('changeInfoUsername');
	const email = document.getElementById('changeInfoEmail');
	const languageSetting = document.getElementById('languageSetting');

	if (data.profile_picture)
		profile_pic.src = "https://localhost" + data.profile_picture;
	username.setAttribute('placeholder', data.username);
	email.setAttribute('placeholder', data.email);
	languageSetting.value = localStorage.getItem('language') || 'en';
}