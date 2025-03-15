async function registerUser(username, first_name, last_name, email, password)
{
	console.log("Form submitted:", username, first_name, last_name, email, password );

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
