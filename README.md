This project is about doing something you’ve never done before.Remind yourself the beginning of your journey in computer science.Look at you now. Time to shine!

// Stop dropdown menu from closing and validate
document.addEventListener('DOMContentLoaded', function() {
	function setupDropdownValidation(formName, validationFunction)
	{
		const form = document.querySelector(formName);
		const dropdownToggle = form.closest('.dropdown').querySelector('dropdown-topple');
		if (form && dropdownToggle)
		{
			form.addEventListener('click', function(event) {
				event.stopPropagation();
			});

			form.addEventListener('submit', function(event)
			{
				if (!validationFunction(event))
				{
					event.preventDefault();
					event.stopPropagation();

					const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
					if (dropdownInstance)
						dropdownInstance.show();
				}
			});
		}
	}
	setupDropdownValidation('.login-drop', validateLoginForm);
	setupDropdownValidation('.signup-drop', validateSignupForm);

	});

function validateLoginForm(event)
{
	const email = document.getElementById('loginEmail');
	const password = document.getElementById('loginPassword');
	let	isValid = true

	removeErrorMessage(password);
	removeErrorMessage(email);

	if (!email.value.trim())
	{
		isValid = false;
		email.classList.add('is-invalid');
		showErrorMessage(email, 'Please enter your email address');
	}
	if (!password.value.trim())
	{
		isValid = false;
		password.classList.add('is-invalid');
		showErrorMessage(password, 'Please enter your password');
	}
	return isValid;
}

function validateSignupForm(event)
{
	const username = document.getElementById('signupUsername');
	const email = document.getElementById('signupEmail');
	const password = document.getElementById('signupPassword');
	const password2 = document.getElementById('signupPassword2');
	let isValid = true;

	removeErrorMessage(username);
	removeErrorMessage(password);
	removeErrorMessage(email);
	removeErrorMessage(password2);
	if (!username.value.trim())
	{
		isValid = false;
		username.classList.add('is-invalid');
		showErrorMessage(username, 'Please enter your username');
	}
	removeErrorMessage(password2);
	if (!email.value.trim())
	{
		isValid = false;
		email.classList.add('is-invalid');
		showErrorMessage(email, 'Please enter your email address');
	}
	if (!password.value.trim())
	{
		isValid = false;
		password.classList.add('is-invalid');
		showErrorMessage(password, 'Please enter your password');
	}
	if (!password2.value.trim())
	{
		isValid = false;
		password2.classList.add('is-invalid');
		showErrorMessage(password2, 'Please enter your password');
	}
	else if (password.value != password2.value)
	{
		isValid = false;
		password.classList.add('is-invalid');
		password2.classList.add('is-invalid');
		showErrorMessage(password, 'Passwords do not match');
		showErrorMessage(password2, 'Passwords do not match');
	}
	return isValid;
}
