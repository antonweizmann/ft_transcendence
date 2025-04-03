import { showErrors } from './error_handling.js';
import { setupLoginOrProfile } from './main.js';

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

export async function loginUser(username, password)
{
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
		}
		else {
			console.error("Error:", await response.json());
			return false
		}
		setupLoginOrProfile();
	} catch (error) {
		console.error(error);
	}
	if (window.location.pathname === '/play')
		document.getElementById('onlineOption').style.display = "block";
	return true;
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
