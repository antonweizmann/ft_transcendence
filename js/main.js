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

window.onload = function () {
	loadPage('home');
};

// Stop dropdown menu from closing and validate
document.addEventListener('DOMContentLoaded', function() {
	const loginForm = document.querySelector('.dropdown-menu.login-drop');
	const dropdownToggle = document.querySelector('.btn.dropdown-toggle');
	if (loginForm && dropdownToggle)
	{
		loginForm.addEventListener('click', function(event) {
			event.stopPropagation();
		});

		const loginDrop = document.querySelector('.login-drop');
        loginDrop.addEventListener('submit', validateLoginForm);
	}
	});

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
	if (!isValid)
	{
		event.preventDefault();
		event.stopPropagation();
		const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
		if (dropdownInstance) {
			dropdownInstance.show();
		}
	}
	return isValid;
}
