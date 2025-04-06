import { setupDropdownValidation, validateLoginForm, updateActive } from './form_validation.js';
import { logoutUser } from './form_submission.js';
import { refreshAccessToken } from './authentication.js';
import { initProfile } from './profile.js';
import { initTournament } from './tournament.js';

window.loadPage = loadPage;
window.signUpInstead = signUpInstead;
window.changeLanguage = changeLanguage;
window.setImagePreview = setImagePreview;

const startPage = 'home';

window.gameState = {
	initialized: false,
	cleanup: null
};

let addedScripts = []; // Array to store references to added scripts

document.addEventListener('DOMContentLoaded', function() {
	setupDropdownValidation('.login-drop', validateLoginForm);

	setupLoginOrProfile();
});

document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('token');
	if (!token)
		return;
	const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
	const isTokenExpired = tokenPayload.exp * 1000 < Date.now();

	if (isTokenExpired) {
		console.warn('Access token expired, refreshing...');
		const tokenRefreshed = await refreshAccessToken();
		if (!tokenRefreshed) {
			console.error('Failed to refresh token, logging out...');
			logoutUser();
		}
	}
});

export function setupLoginOrProfile() {
	//replace by validation of choice
	const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

	const loginButton = document.getElementById('loginDropdownButton');
	const profileButton = document.getElementById('profileButton');

	if (isLoggedIn) {
		loginButton.style.display = 'none';
		profileButton.style.display = 'block';
		// To display the username in the profile button uncomment the following
		// and remove the data-translate attribute from the button in the HTML
		// if (localStorage.getItem('username')) {
		// 	profileButton.textContent = localStorage.getItem('username');
		// }
	} else {
		loginButton.style.display = 'block';
		profileButton.style.display = 'none';
	}
}

function loadScripts(scripts) {
	for (let script of scripts) {
		if (script) {
			// Load external scripts
			const newScript = document.createElement('script');
			newScript.src = `js/${script}`;
			newScript.type = 'module';
			document.body.appendChild(newScript);
			addedScripts.push(newScript); // Store reference to the added script
		} else {
			// Execute inline scripts
			eval(script.innerHTML);
		}
	}
}

function removeAddedScripts() {
	addedScripts.forEach(script => {
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
	});
	addedScripts = []; // Clear the array
}

/**
 * This function loads the requested html page.
 * It is a async func so we are able to use the await keyword.
 * This enable us to wait until the fetch method gets the contents of the file
 * and wait until the text method extracts the text for the response of fetch.
 * @param {string} pageName - Page to load.
 */
export async function loadPage(pageName)
{
	window.history.pushState({page: pageName}, '', `/${pageName}`);
	getPage(pageName);
}

async function loadPageReplace(pageName)
{
	window.history.replaceState({page: pageName}, '', `/${pageName}`);
	getPage(pageName);
}

export function closeMobileMenu() {
	const collapseElement = document.getElementById('navbarNav');
	if (collapseElement.classList.contains('show')) {
		const collapse = new bootstrap.Collapse(collapseElement);
		collapse.hide();
	}
}

function cleanupPage()
{
	if (window.gameState.cleanup)
		window.gameState.cleanup();
	removeAddedScripts();
}

export async function fetchPageContent(pageName) {
	const response = await fetch(`/pages/${pageName}.html`)
	if (response.status === 404)
	{
		loadPageReplace(startPage);
		return null;
	}
	if (!response.ok)
		throw new Error(`HTTP error! Status: ${response.status}`);
	return response.text();
}

async function getPage(pageName) {
	closeMobileMenu();
	try
	{
		cleanupPage();
		const content = await fetchPageContent(pageName);
		if (content === null)
			return ;
		document.getElementById('main-content').innerHTML = content;
		updateActive(pageName);
		if (pageName === 'play')
		{
			window.gameState = {
				initialized: false,
				cleanup: null
			};
			loadScripts([
				'game/ai.js',
				'game/draw_game.js',
				'game/element.js',
				'game/game.js',
				'game/init_game.js',
				'game/listeners_game.js',
				'game/movement_game.js',
				'game/online_game.js'
			]);
			setTimeout(() => {
				if (window.ensureInit) {
					window.ensureInit();
				}
			}, 50);
		} 
		else if (pageName === 'profile') {
			loadScripts(['profile.js']);
			setTimeout(() => {
					initProfile();
			}, 500);
		}
		else if (pageName === 'tournament') {
			loadScripts(['tournament.js']);
			setTimeout(() => {
					initTournament();
			}, 500);
		}
		changeLanguage();
	}
	catch (error)
	{
		console.error('Error loading page:', error)
		document.getElementById('main-content').innerHTML = `<p>Error loading content ${pageName} . Please try again later.</p>`
	}
}

window.onload = function () {
	let path = window.location.pathname;
	console.log(path);
	// Remove leading and trailing slashes, and get the first segment of the path
	path = path.replace(/^\/|\/$/g, '');
	console.log(path);

	// If path is empty or 'index.html', default to 'home'
	if (!path || path === 'index.html') {
		loadPageReplace(startPage);
		return;
	}
	if (path === 'profile' && !localStorage.getItem('user_id')) {
		logoutUser();
		loadPageReplace(startPage);
		return;
	}

	console.log(`Loading path: ${path}`);
	getPage(path);
};

function changeLanguage(event) {
	const selectedLanguage = event ? event.target.value : localStorage.getItem('language') || 'en'; // Get the selected language (e.g., 'en' or 'es')

	// Save the selected language in localStorage to persist across sessions
	localStorage.setItem('language', selectedLanguage);

	// Load the translations for the selected language
	loadTranslations(selectedLanguage);
}

function loadTranslations(language) {
	// Fetch the translations JSON file
	fetch('/languages.json')
		.then(response => response.json())
		.then(data => {
			// If the selected language exists in the translations file
			if (data[language]) {
				// Update the page content with the translations
				updatePageContent(data[language]);
			} else {
				console.error(`Language ${language} not found in translations file.`);
				// Optionally, fallback to a default language (e.g., 'en')
				updatePageContent(data['en']);
			}
		})
		.catch(error => {
			console.error('Error loading translations:', error);
			// Fallback to English if the JSON file cannot be loaded
			loadTranslations('en'); // seems like a loop
		});
}

function updatePageContent(translations) {
	// Update each element with a data-translate attribute using the corresponding translation
	document.querySelectorAll('[data-translate]').forEach(element => {
		const translationKey = element.getAttribute('data-translate');

		// If the translation exists for this key, update the element's text
		if (translations[translationKey]) {
			element.textContent = translations[translationKey];
		}
	});
}

// window.addEventListener('load', () => {
// 	const path = window.location.pathname;
// 	console.log(`Loading path: ${path}`);
// 	loadPage(path.substring(1) || 'home'); // Remove leading slash and default to 'home'
//   });


window.addEventListener(`popstate`, function (event) {
	if (event.state)
	{
		getPage(event.state.page);
	}
});

function signUpInstead() {
	const dropdownButton = document.getElementById('loginDropdownButton');
	const dropdown = new bootstrap.Dropdown(dropdownButton);

	dropdown.hide();
	loadPage('signup');
}

function setImagePreview(inputElement) {
	const previewImage = document.getElementById('previewImage');
	const file = inputElement.files[0];

	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			previewImage.src = e.target.result; // Update the src attribute
		};
		reader.readAsDataURL(file); // Read the file as a Data URL
	} else {
		previewImage.src = '../assets/default_profile.png'; // Reset to placeholder if no file is selected
	}
}
