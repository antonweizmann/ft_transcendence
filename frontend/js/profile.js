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

	authenticatedFetch('https://localhost/api/player/' + userId + '/', {
		method: 'GET',
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			document.getElementById('username').textContent = data.username;
			if (data.profile_picture)
				document.getElementById('profile_pic').src = "https://localhost" + data.profile_picture;
			document.getElementById('profile-container').classList.remove('loading');
		})
		.catch(error => {
			console.error('Error fetching user data:', error);
		});
}

// loadProfile();
