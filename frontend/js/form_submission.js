async function registerUser(username, firstname, lastname, email, password)
{
	console.log("Form submitted:", { username, firstname, lastname, email, password });

	const response = await fetch('http://localhost:8000/api/player/register/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, firstname, lastname, email, password })
	});
	if (response.ok)
		console.log(`user ${username} registered successfully!`);
	else
		console.error("Error:", await response.json());
}
window.registerUser = registerUser;
