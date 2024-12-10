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
