import { authenticatedFetch } from './authentication.js';

window.initProfile = initProfile;

console.log("Profile JS pre-loaded");

export function initProfile() {
	if (document.readyState === 'complete') {
		console.log('Document already complete, initializing now');
		loadProfile();
	} else {
		console.log('Document not ready, adding listener');
		document.addEventListener('DOMContentLoaded', loadProfile);
	}
}

function loadProfile() {
	console.log("Profile JS loaded");
	const userId = localStorage.getItem('user_id');
	const username = localStorage.getItem('username');

	LoadDataFromBackend(`/api/player/${userId}/`, setProfileData);
	LoadDataFromBackend(`/api/pong/match/list/?username=${username}`, setStats);
}

function setProfileData(data) {
	const profile_pic = document.getElementById('profile_pic');
	const username = document.getElementById('username');
	const profile_container = document.getElementById('profile_container');

	username.textContent = data.username;
	if (data.profile_picture)
		profile_pic.src = "https://localhost" + data.profile_picture;
	profile_container.classList.remove('loading');
}

async function LoadDataFromBackend(url, setter) {
	try {
		const response = await authenticatedFetch(url, { method: 'GET' });

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		if (setter)
			setter(data);
		return data;
	}
	catch (error) {
		console.error('Error fetching data:', error);
	}
}

function setStats(data) {
	console.log(data);
}
