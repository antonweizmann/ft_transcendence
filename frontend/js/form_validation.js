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
				dropdownInstance.hide();
		});
	}
}

async function validateLoginForm(event)
{
	const username = document.getElementById('loginUsername');
	const password = document.getElementById('loginPassword');

	removeErrorMessage(password);
	removeErrorMessage(username);

	if (!username.value.trim())
	{
		username.classList.add('is-invalid');
		showErrorMessage(username, 'Please enter your username');
	}
	if (!password.value.trim())
	{
		password.classList.add('is-invalid');
		showErrorMessage(password, 'Please enter your password');
	}
	if (!password.value.trim() || !username.value.trim())
		return false;
	const loginSuccess = await window.loginUser(username.value, password.value);
	if (!loginSuccess)
		console.log('Error logging in user');
	return loginSuccess;
}

async function validateSignUpForm(event)
{
	event.preventDefault();

	let errors = {};
	const fields = [
		{ key : 'username',		field : document.getElementById('signUpUsername') },
		{ key : 'first_name',	field : document.getElementById('signUpFirstName') },
		{ key : 'last_name',	field : document.getElementById('signUpLastName') },
		{ key : 'email',		field : document.getElementById('signUpEmail') },
		{ key : 'password',		field : document.getElementById('signUpPassword') },
		{ key : 'password2',	field : document.getElementById('signUpPassword2') }
	];

	fields.forEach(({ key, field }) => {
		removeErrorMessage(field);
		if (!field.value.trim())
			errors[key] = 'Please enter your ' + key;
	});
	if (Object.keys(errors).length == 0) {
		isEmailValid(errors);
		isPasswordValid(errors);
	}
	if (Object.keys(errors).length > 0) {
		showErrors(fields, errors);
		return false;
	}
	if (!await window.registerUser(fields))
		return false;
	loadPage('home');
	setupLoginOrProfile();
	return true;
}

function isEmailValid(errors) {
	const email = document.getElementById('signUpEmail');
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

	errors.email = errors.email || [];
	if (!emailRegex.test(email.value)) {
		email.classList.add('is-invalid');
		errors.email.push('Please enter a valid email address');
	}
	if (errors.email.length === 0)
		delete errors.email;
}

function isPasswordValid(errors)
{
	const password = document.getElementById('signUpPassword');
	const password2 = document.getElementById('signUpPassword2');
	const rules = [
		{ test: () => password.value !== password2.value,
			message: 'Passwords do not match',
			fields: [password, password2] },
		{ test: () => password.value.length < 8,
			message: 'Password must be at least 8 characters',
			fields: [password] },
		{ test: () => !/\d/.test(password.value),
			message: 'Password must contain at least one number',
			fields: [password] },
		{ test: () => !/[a-z]/.test(password.value),
			message: 'Password must contain at least one lowercase letter',
			fields: [password] },
		{ test: () => !/[A-Z]/.test(password.value),
			message: 'Password must contain at least one uppercase letter',
			fields: [password] },
		{ test: () => !/[!@#$%^&*]/.test(password.value),
			message: 'Password must contain at least one special character (!@#$%^&*)',
			fields: [password] },
	];

	errors.password = errors.password || [];
	errors.password2 = errors.password2 || [];

	rules.forEach(({ test, message, fields }) => {
		if (test()) {
			fields.forEach(field => field.classList.add('is-invalid'));
			errors.password.push(message);
		}
	});
	if (errors.password.length === 0)
		delete errors.password;
	if (errors.password2.length === 0)
		delete errors.password2;
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
