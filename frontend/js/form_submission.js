import { showErrors, removeErrorMessage, showErrorMessage } from './error_handling.js';
import { authenticatedFetch } from './authentication.js';
import { loadPage, setupLoginOrProfile } from './main.js';

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
		const response = await authenticatedFetch(`https://localhost/api/player/${localStorage.getItem("user_id")}/`, {
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
	loadPage('profile');
	return true;
}

export async function loginUser(username, password)
{
	const loginFields = [
		{ key: 'username', field: document.getElementById('loginUsername') },
		{ key: 'password', field: document.getElementById('loginPassword') }
	];

	loginFields.forEach(({ field }) => removeErrorMessage(field));


	const form_data = new FormData();
	form_data.append('username', username);
	form_data.append('password', password);

	try {
		const response = await fetch('https://localhost/api/token/', {
			method: 'POST',
			body: form_data,
		});
		if (response.ok)
		{
			const data = await response.json();
			localStorage.setItem('token', data.access);
			localStorage.setItem('refresh', data.refresh);
			localStorage.setItem('username', username);
			localStorage.setItem('user_id', data.user_id);
			localStorage.setItem('isLoggedIn', true);
			console.log(`user ${username} logged in successfully!`);

			setupLoginOrProfile();

			if (window.location.pathname === '/play')
				document.getElementById('onlineOption').style.display = "block";

			return true;
		}
		else {
			const errors = await response.json();

			// Handle non-field errors (like invalid credentials)
			if (errors.non_field_errors || errors.detail) {
				const errorMessage = errors.non_field_errors || [errors.detail];

				// Display error on both fields
				loginFields.forEach(({ field }) => {
					field.classList.add('is-invalid');
					showErrorMessage(field, errorMessage);
				});
			} else {
				// Handle field-specific errors
				showErrors(loginFields, errors);
			}

			console.error("Login failed:", errors);
			return false;
		}
	} catch (error) {
		console.error("Login request failed:", error);

		// Show a general error message on both fields
		loginFields.forEach(({ field }) => {
			field.classList.add('is-invalid');
			showErrorMessage(field, ["Connection failed. Please try again."]);
		});

		return false;
	}
}

export function logoutUser()
{
	localStorage.removeItem('isLoggedIn');
	localStorage.removeItem('token');
	localStorage.removeItem('refresh');
	localStorage.removeItem('username');
	localStorage.removeItem('user_id');
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
