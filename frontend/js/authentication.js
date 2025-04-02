export async function refreshAccessToken() {
	const refreshToken = localStorage.getItem('refresh');
	if (!refreshToken) {
		console.error('No refresh token found');
		return false;
	}

	try {
		const response = await fetch('https://localhost/api/token/refresh/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refresh: refreshToken }),
		});

		if (response.ok) {
			const data = await response.json();
			localStorage.setItem('token', data.access); // Update the access token
			console.log('Access token refreshed successfully');
			return true;
		} else {
			console.error('Failed to refresh access token:', await response.json());
			return false;
		}
	} catch (error) {
		console.error('Error refreshing access token:', error);
		return false;
	}
}

export async function authenticatedFetch(url, options = {}) {
	const token = localStorage.getItem('token');
	if (!options.headers) {
		options.headers = {};
	}

	// Add the Authorization header with the access token
	if (token) {
		options.headers['Authorization'] = `Bearer ${token}`;
	}

	let response = await fetch(url, options);

	// If the access token has expired, try refreshing it
	if (response.status === 401) {
		console.warn('Access token expired, attempting to refresh...');
		const tokenRefreshed = await refreshAccessToken();

		if (tokenRefreshed) {
			// Retry the original request with the new token
			const newToken = localStorage.getItem('token');
			options.headers['Authorization'] = `Bearer ${newToken}`;
			response = await fetch(url, options);
		}
	}

	return response;
}
