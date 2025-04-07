import { showErrors, removeErrorMessage, showErrorMessage, showErrorInAllFields } from './error_handling.js';
import { authenticatedFetch } from './authentication.js';
import { setupLoginOrProfile } from './main.js';
import { getCookie } from './cookies.js';

window.logoutUser = logoutUser;

export async function registerUser(fields)
{
	const form_data = new FormData();

	fields.forEach(({ key, field }) => {
		if (field.type === 'file' && field.files.length > 0)
			form_data.append(key, field.files[0]);
		else
			form_data.append(key, field.value);
	});
	try {
		const response = await fetch('https://localhost/api/player/register/', {
			method: 'POST',
			body: form_data,
			credentials: 'include',
			mode: 'cors'
		});
		if (!response.ok) {
			const errors = await response.json();
			showErrors(fields, errors);
			return false
		}
	} catch (error) {
		console.error("Failed registration:", error);
		return false
	}
	const username = fields.find(f => f.key === 'username').field.value;
	const password = fields.find(f => f.key === 'password').field.value;

	console.log(`user ${username} registered successfully!`);
	loginUser(username, password);
	return true;
}

export async function changeUserInfo(fields)
{
	const form_data = new FormData();

	fields.forEach(({ key, field }) => {
		if (field.type === 'file' && field.files.length > 0)
			form_data.append(key, field.files[0]);
		else
			form_data.append(key, field.value);
	});

	try {
		const response = await authenticatedFetch(`https://localhost/api/player/${getCookie('user_id')}/`, {
		method: 'PUT',
		body: form_data,
		credentials: 'include',
		mode: 'cors'
		});

		if (!response.ok) {
			const errors = await response.json();
			showErrors(fields, errors);
			return false;
		}
	} catch (error) {
		console.error("Failed to update user info:", error);
		return false;
	}

	console.log("User info updated successfully!");
	return true;
}

export async function loginUser(username, password)
{
	const form_data = new FormData();
	const loginFields = [
		{ key: 'username', field: document.getElementById('loginUsername') },
		{ key: 'password', field: document.getElementById('loginPassword') }
	];

	loginFields.forEach(({ field }) => removeErrorMessage(field));
	form_data.append('username', username);
	form_data.append('password', password);
	try {
		const response = await fetch('https://localhost/api/token/', {
			method: 'POST',
			body: form_data,
		});
		if (!response.ok)
			return handleLoginError(await response.json(), loginFields);
	}
	catch (error) {
		console.error("Login request failed:", error);
		showErrorInAllFields(loginFields, "Network error. Please try again.");
		return false;
	}
	localStorage.setItem('username', username);
	localStorage.setItem('isLoggedIn', true);
	setupLoginOrProfile();
	if (window.location.pathname === '/play')
		document.getElementById('onlineOption').style.display = "block";
	return true;
}

function handleLoginError(errors, loginFields)
{
	if (errors.non_field_errors || errors.detail)
		showErrorInAllFields(loginFields, errors.non_field_errors || [errors.detail]);
	else
		showErrors(loginFields, errors);
	console.error("Login failed:", errors);
	return false;
}

export function logoutUser()
{
	fetch('https://localhost/api/token/logout/', {
		method: 'POST',
	})
	localStorage.removeItem('isLoggedIn');
	localStorage.removeItem('username');
	setupLoginOrProfile();
	console.log('User logged out successfully!');
	loadPage('home')
	if (window.location.pathname === '/play')
	{
		document.getElementById('onlineOption').style.display = "none";
		if (document.getElementById('gameMode').value === 'online')
		{
			document.getElementById('gameMode').value = 'human';
			window.changeGameMode();
		}
	}
}
