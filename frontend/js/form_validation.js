// Stop dropdown menu from closing and validate
function setupDropdownValidation(formName, validationFunction)
{
	const form = document.querySelector(formName);
	const dropdownToggle = form.closest('.dropdown').querySelector('.dropdown-toggle');
	if (form && dropdownToggle)
	{
		form.addEventListener('click', function(event) {
			event.stopPropagation();
		});

		form.addEventListener('submit', function(event)
		{
			const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);

			event.preventDefault();
			if (!validationFunction(event))
				event.stopPropagation();
			else
			{
				dropdownInstance.hide();
				localStorage.setItem('isLoggedIn', true);
				setupLoginOrProfile();
			}
		});
	}
}

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

async function validateSignupForm(event)
{
	event.preventDefault();

	const username = document.getElementById('signupUsername');
	const first_name = document.getElementById('signupFirstName');
	const last_name = document.getElementById('signupLastName');
	const email = document.getElementById('signupEmail');
	const password = document.getElementById('signupPassword');
	const password2 = document.getElementById('signupPassword2');
	let isValid = true;

	removeErrorMessage(username);
	removeErrorMessage(first_name);
	removeErrorMessage(last_name);
	removeErrorMessage(email);
	removeErrorMessage(password);
	removeErrorMessage(password2);
	console.log('Form submitted:', username, first_name, last_name, email, password);
	if (!username.value.trim())
	{
		isValid = false;
		username.classList.add('is-invalid');
		showErrorMessage(username, 'Please enter your username');
	}
	if (!first_name.value.trim())
	{
		isValid = false;
		first_name.classList.add('is-invalid');
		showErrorMessage(first_name, 'Please enter your first_name');
	}
	if (!last_name.value.trim())
	{
		isValid = false;
		last_name.classList.add('is-invalid');
		showErrorMessage(last_name, 'Please enter your last_name');
	}
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
	if (isValid)
	{
		const registrationSuccess = await window.registerUser(username, first_name, last_name, email, password);
		if (registrationSuccess)
		{
			loadPage('home');
			setupLoginOrProfile();
		}
		else
			console.log('Error registering user');
		isValid = registrationSuccess;
	}
	return isValid;
}

function showErrorMessage(input, message)
{
	const errorMessage = document.createElement('div');
	errorMessage.classList.add('invalid-feedback', 'd-block');
	errorMessage.textContent = message;
	input.parentNode.appendChild(errorMessage);
}

function removeErrorMessage(input)
{
	input.classList.remove('is-invalid');
	const existingErrors = input.parentNode.querySelectorAll('.invalid-feedback');
	existingErrors.forEach(error => error.remove());
}

function updateActive(pageName)
{
	const activeNavLink = document.querySelector('a.nav-link.active');
	if (activeNavLink)
	{
		activeNavLink.removeAttribute('aria-current');
		activeNavLink.classList.remove ('active');
	}

	const newActiveNavLink = document.querySelector(`a.nav-link[onclick="loadPage('${pageName}')"]`);
	if (newActiveNavLink)
	{
		newActiveNavLink.classList.add('active');
		newActiveNavLink.setAttribute('aria-current', 'page');
	}

}
