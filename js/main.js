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
		let path = window.location.pathname;
		// Remove leading and trailing slashes, and get the first segment of the path
		path = path.replace(/^\/|\/$/g, '').split('/')[0];

		// If path is empty or 'index.html', default to 'home'
		if (!path || path === 'index.html') {
			path = 'home';
		}

		console.log(`Loading path: ${path}`);
		loadPage(path);
};

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

