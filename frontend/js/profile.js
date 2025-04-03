console.log("Profile JS pre-loaded");
initProfile();

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
			console.log('User data:', data);
			console.log(document.getElementById('username'));
		})
		.catch(error => {
			console.error('Error fetching user data:', error);
		});
}

// loadProfile();
