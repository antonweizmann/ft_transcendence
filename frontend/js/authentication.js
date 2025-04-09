import { getCookie } from './cookies.js';

export async function fetchUserData(user_id) {
	try {
		if (user_id) {
			const response = await authenticatedFetch(`https://localhost/api/player/${user_id}/`);
			return await response.json();
		}
		else {
			const response = await authenticatedFetch(`https://localhost/api/player/${getCookie("user_id")}`);
			return await response.json();
		}
	} catch (error) {
		console.error('Error fetching User data:', error);
	}
}

export async function refreshAccessToken() {
	try {
		const response = await fetch('https://localhost/api/token/refresh/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			console.error('Failed to refresh access token:', await response.json());
			return false;
		}
		console.log('Access token refreshed successfully');
	} catch (error) {
		console.error('Error refreshing access token:', error);
		return false;
	}
	return true;
}

export async function authenticatedFetch(url, options = {}) {
	if (!options.headers) {
		options.headers = {};
	}
	let response = await fetch(url, options);

	// If the access token has expired, try refreshing it
	if (response.status === 401) {
		console.warn('Access token expired, attempting to refresh...');
		const tokenRefreshed = await refreshAccessToken();

		if (tokenRefreshed) {
			response = await fetch(url, options);
		}
	}

	return response;
}
