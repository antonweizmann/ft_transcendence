let addedScripts = []; // Array to store references to added scripts

document.addEventListener('DOMContentLoaded', function() {
    setupDropdownValidation('.login-drop', validateLoginForm);
	// setupDropdownValidation('.signup-drop', validateSignupForm);

    setupLoginOrProfile();
});

function setupLoginOrProfile() {
    //replace by validation of choice
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const loginButton = document.getElementById('loginDropdownButton');
    const profileButton = document.getElementById('profileButton');

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        profileButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        profileButton.style.display = 'none';
    }
    console.log('Login Button:', loginButton);
    console.log('Profile Button:', profileButton);
}

function loadScripts(scripts) {
    for (let script of scripts) {
        if (script.src) {
            // Load external scripts
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.type = script.type;
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
async function loadPage(pageName)
{
	window.history.pushState({page: pageName}, ``);
	getPage(pageName);
}

async function getPage(pageName)
{
	try
	{
        removeAddedScripts();
		const response = await fetch(`/pages/${pageName}.html`)
		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`)
		const content = await response.text();
		document.getElementById('main-content').innerHTML = content;
		updateActive(pageName);
        if (pageName === 'play')
            loadScripts([{ type: 'module', src: 'js/game.js' }, {type: 'module', src: 'js/ai.js' }]);
		// const scripts = document.getElementById('main-content').getElementsByTagName('script');
        // loadScripts(scripts);
		changeLanguage();
	}
	catch (error)
	{
		console.error('Error loading page:', error)
		document.getElementById('main-content').innerHTML = '<p>Error loading content. Please try again later.</p>'
	}
}

	window.onload = function () {
		let path = window.location.pathname;
		// Remove leading and trailing slashes, and get the first segment of the path
		path = path.replace(/^\/|\/$/g, '').split('/')[0];

		// If path is empty or 'index.html', default to 'home'
		if (!path || path === 'index.html') {
			path = 'play';
		}

		console.log(`Loading path: ${path}`);
		loadPage(path);
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
