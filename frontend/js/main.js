import { setupDropdownValidation, validateLoginForm, updateActive } from './form_validation.js';
import { initProfile, LoadDataFromBackend } from './profile.js';
import { initTournament } from './tournament/tournament.js';
import { getCookie } from './utils.js';
import { ensureInit } from './game/init_game.js';
import { changeLanguage } from './translations.js';

window.loadPage = loadPage;
window.signUpInstead = signUpInstead;
window.setImagePreview = setImagePreview;

const startPage = 'home';

window.gameState = {
	initialized: false,
	cleanup: null
};

const restrictedPages = [
	'profile',
	'tournament',
	'tournament_lobby',
]

document.addEventListener('DOMContentLoaded', function() {
	setupDropdownValidation('.login-drop', validateLoginForm);

	updateUIBasedOnAuth();
});

export function updateUIBasedOnAuth() {
	const isLoggedIn = getCookie('user_id') || false;
	const loginButton = document.getElementById('loginDropdownButton');
	const profileButton = document.getElementById('profileButton');
	const tournamentNav = document.getElementById('tournamentNav');
	const friendButton = document.getElementById('friendsTrigger');

	if (isLoggedIn) {
		friendButton.style.display = 'block';
		tournamentNav.style.display = 'block';
		loginButton.style.display = 'none';
		profileButton.style.display = 'block';
	} else {
		friendButton.style.display = 'none';
		tournamentNav.style.display = 'none';
		loginButton.style.display = 'block';
		profileButton.style.display = 'none';
	}
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
	if (window.resetTournamentSocket)
		window.resetTournamentSocket();
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
			setTimeout(ensureInit, 50);
		} 
		else if (pageName === 'profile') {
			setTimeout(initProfile , 500);
		}
		else if (pageName === 'tournament') {
			setTimeout(initTournament, 500);
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

	path = path.replace(/^\/|\/$/g, '');
	if (!path || path === 'index.html') {
		loadPageReplace(startPage);
		return;
	}
	if ((restrictedPages.includes(path) && !getCookie('user_id')) || path === 'tournament_lobby') {
		loadPageReplace(startPage);
		return;
	}
	console.log(`Loading path: ${path}`);
	getPage(path);
};

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
		LoadDataFromBackend(`/api/player/${getCookie('user_id')}/`, (data) => {
			previewImage.src = data.profile_picture;
		});
	}
}
