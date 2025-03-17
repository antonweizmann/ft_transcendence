async function registerUser(username, first_name, last_name, email, password)
{
	const form_data = new FormData();
	form_data.append('username', username);
	form_data.append('first_name', first_name);
	form_data.append('last_name', last_name);
	form_data.append('email', email);
	form_data.append('password', password);

	try {
		const response = await fetch('https://localhost/api/player/register/', {
			method: 'POST',
			body: form_data,
		});
		if (response.ok)
			console.log(`user ${username} registered successfully!`);
		else {
			console.error("Error:", await response.json());
			return false
		}
	} catch (error) {
		console.error(error);
	}
	return true;
}
window.registerUser = registerUser;

async function loginUser(username, password)
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
			console.log(data);
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
	return true;
}
window.loginUser = loginUser;

function logoutUser()
{
	localStorage.removeItem('isLoggedIn');
	localStorage.removeItem('token');
	localStorage.removeItem('refresh');
	localStorage.removeItem('username');
	localStorage.removeItem('user_id');
	setupLoginOrProfile();
	console.log('User logged out successfully!');
}
window.logoutUser = logoutUser;