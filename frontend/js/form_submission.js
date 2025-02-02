async function registerUser(username, firstname, lastname, email, password) {
	console.log("Form submitted:", { username, firstname, lastname, email, password });

	try {
		const response = await fetch('http://localhost:8000/api/player/register/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username,
				first_name: firstname,
				last_name: lastname,
				email: email,
				password: password
			}),
		});

		if (response.ok) {
			console.log(`user ${username} registered successfully!`);
		} else {
			const errorData = await response.json();
			console.error("Error:", errorData);
		}
	} catch (error) {
		console.error("Fetch error:", error);
	}
}

window.registerUser = registerUser;
