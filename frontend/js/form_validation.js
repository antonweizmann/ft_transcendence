import { loadPage, setupLoginOrProfile } from './main.js';
import { removeErrorMessage, showErrors, showErrorMessage } from './error_handling.js';
import { registerUser, loginUser } from './form_submission.js';
import { changeUserInfo } from './form_submission.js';

window.validateSignUpForm = validateSignUpForm;
window.validateChangeInfoForm = validateChangeInfoForm;

// Stop dropdown menu from closing and validate

export function setupDropdownValidation(formName, validationFunction)
{
	const form = document.querySelector(formName);
	const dropdownToggle = form.closest('.dropdown').querySelector('.dropdown-toggle');
	if (form && dropdownToggle)
	{
		form.addEventListener('click', function(event) {
			event.stopPropagation();
		});

		form.addEventListener('submit', async function(event)
		{
			const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);

			event.preventDefault();
			const isValid = await validationFunction(event); // <--- await here!

			if (isValid === false)

				event.stopPropagation();
			else
				dropdownInstance.hide();
		});
	}
}

export async function validateLoginForm(event)
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
	const loginSuccess = await loginUser(username.value, password.value);
	if (!loginSuccess)
		console.log('Error logging in user');
	return loginSuccess;
}

async function validateSignUpForm(event)
{
	event.preventDefault();

	let errors = {};
	const fields = [
		{ key : 'username',			field : document.getElementById('signUpUsername') },
		{ key : 'first_name',		field : document.getElementById('signUpFirstName') },
		{ key : 'last_name',		field : document.getElementById('signUpLastName') },
		{ key : 'email',			field : document.getElementById('signUpEmail') },
		{ key : 'password',			field : document.getElementById('signUpPassword') },
		{ key : 'password2',		field : document.getElementById('signUpPassword2') },
		{ key : 'profile_picture',	field : document.getElementById('formFile') },
	];

	fields.forEach(({ key, field }) => {
		removeErrorMessage(field);
		if (key === 'profile_picture')
			return ;
		if (!field.value.trim())
			errors[key] = 'Please enter your ' + key;
	});
	if (Object.keys(errors).length === 0) {
		isEmailValid(errors, document.getElementById('signUpEmail'));
		isPasswordValid(errors, document.getElementById('signUpPassword'), document.getElementById('signUpPassword2'));
	}
	if (Object.keys(errors).length > 0) {
		showErrors(fields, errors);
		return false;
	}
	if (!await registerUser(fields))
		return false;
	loadPage('home');
	setupLoginOrProfile();
	return true;
}

async function validateChangeInfoForm(event) {
	event.preventDefault();

	let errors = {};
	const allFields = [
		{ key : 'username',			field : document.getElementById('changeInfoUsername') },
		{ key : 'email',			field : document.getElementById('changeInfoEmail') },
		{ key : 'password',			field : document.getElementById('changeInfoPassword') },
		{ key : 'password2',		field : document.getElementById('changeInfoPassword2') },
		{ key : 'passwordCurrent',	field : document.getElementById('changeInfoPasswordCurrent') },
		{ key : 'profile_picture',	field : document.getElementById('formFile') },
		{ key: 'language',			field: document.getElementById('languageSetting') }
	];

	const fields = allFields.filter(({ key, field }) => field && field.value.trim() !== '' || key === 'passwordCurrent');

	fields.forEach(({ key, field }) => {
		removeErrorMessage(field);
		if (key === 'profile_picture' || key === 'language')
			return ;
	});
	if (Object.keys(errors).length === 0) {
		if (fields.find(({ key }) => key === 'email'))
			isEmailValid(errors, document.getElementById('changeInfoEmail'));
		if (fields.find(({ key }) => key === 'password') || fields.find(({ key }) => key === 'password2'))
		isPasswordValid(errors, document.getElementById('changeInfoPassword'), document.getElementById('changeInfoPassword2'));
	}
	if (fields.find(({ key }) => key === 'passwordCurrent').field.value === '')
		errors['passwordCurrent'] = 'Please enter your current password';
	if (Object.keys(errors).length > 0) {
		showErrors(fields, errors);
		return false;
	}

	if (!await changeUserInfo(fields))
		return false;
	return true;
}



function isEmailValid(errors, email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

	errors.email = errors.email || [];
	if (!emailRegex.test(email.value)) {
		email.classList.add('is-invalid');
		errors.email.push('Please enter a valid email address');
	}
	if (errors.email.length === 0)
		delete errors.email;
}

function isPasswordValid(errors, password, password2)
{
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

export function updateActive(pageName)
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
