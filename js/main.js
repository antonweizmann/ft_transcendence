/**
 * This function loads the requested html page.
 * It is a async func so we are able to use the await keyword.
 * This enable us to wait until the fetch method gets the contents of the file
 * and wait until the text method extracts the text for the response of fetch.
 * @param {string} pageName - Page to load.
 */
async function loadPage(pageName)
{
	try
	{
		const response = await fetch(`/pages/${pageName}.html`)
		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`)
		const content = await response.text();
		document.getElementById('main-content').innerHTML = content;
		updateActive(pageName);
	}
	catch (error)
	{
		console.error('Error loading page:', error)
		document.getElementById('main-content').innerHTML = '<p>Error loading content. Please try again later.</p>'
	}
}

window.onload = function () {
	loadPage('home');
};

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



// Stop dropdown menu from closing and validate
document.addEventListener('DOMContentLoaded', function() {
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
				if (!validationFunction(event))
				{
					event.preventDefault();
					event.stopPropagation();

					const dropdownInstance = bootstrap.Dropdown.getOrCreateInstance(dropdownToggle);
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
