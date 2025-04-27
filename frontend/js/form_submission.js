import { showErrors, removeErrorMessage, showErrorMessage, showErrorInAllFields } from './error_handling.js';
import { authenticatedFetch } from './authentication.js';
import { getCookie, showToast } from './utils.js';
import { changeGameMode } from './game/init_game.js';
import { loadPage, updateUIBasedOnAuth } from './main.js';

window.logoutUser = logoutUser;

export {
	registerUser,
	loginUser,
	changeUserInfo,
};

async function registerUser(fields)
{
	const form_data = new FormData();

	fields.forEach(({ key, field }) => {
		if (field.type === 'file' && field.files.length > 0)
			form_data.append(key, field.files[0]);
		else
			form_data.append(key, field.value);
	});
	try {
		const response = await fetch('/api/player/register/', {
			method: 'POST',
			body: form_data,
			credentials: 'include',
			mode: 'cors'
		});
		if (!response.ok) {
			if (response.status === 413)
			{
				showToast("Error", "Image too large")
				return false;
			}
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

async function changeUserInfo(fields)
{
	const form_data = new FormData();

	const newLang = fields.find(f => f.key === 'language')?.field.value;
	if (newLang)
	{
		localStorage.setItem('language', newLang);
		document.getElementById('languageDropdown').value = newLang;
	}
	fields.forEach(({ key, field }) => {
		if (field.type === 'file' && field.files.length > 0)
			form_data.append(key, field.files[0]);
		else
			form_data.append(key, field.value);
	});

	try {
		const response = await authenticatedFetch(`/api/player/${getCookie('user_id')}/`, {
		method: 'PUT',
		body: form_data,
		credentials: 'include',
		mode: 'cors'
		});

		if (!response.ok) {
			if (response.status === 413)
				{
					showToast("Error", "Image too large")
					return false;
				}
			const errors = await response.json();
			showErrors(fields, errors);
			return false;
		}
	} catch (error) {
		console.error("Failed to update user info:", error);
		return false;
	}

	console.log("User info updated successfully!");
	loadPage('profile');
	return true;
}

async function loginUser(username, password)
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
		const response = await fetch('/api/token/', {
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
	updateUIBasedOnAuth();
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

function logoutUser()
{
	const gameModeSelector = document.getElementById('gameMode');

	fetch('/api/token/logout/', {
		method: 'POST',
	})
	localStorage.removeItem('username');
	loadPage('home')
	if (window.location.pathname === '/play')
	{
		document.getElementById('onlineOption').style.display = "none";
		if (gameModeSelector.value === 'online')
		{
			gameModeSelector.value = 'human';
			changeGameMode();
		}
	}
	console.log('User logged out successfully!');
	setTimeout(updateUIBasedOnAuth, 50);
}
