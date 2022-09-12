const puppeteer = require('puppeteer');

async function startBrowser() {
	let browser;
	try {
		console.log("Opening the browser......");
		browser = await puppeteer.launch({
			headless: true,
			args: ["--disable-setuid-sandbox"],
			'ignoreHTTPSErrors': true,
			userDataDir: '/tmp/myChromeSession'
		});
	} catch (err) {
		console.log("Could not create a browser instance => : ", err);
	}
    console.log('browser ready!');
	return browser;
}

module.exports = {
	startBrowser
};