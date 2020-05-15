// importing required packages
const puppeteer = require("puppeteer");

// gets the html content of the playlist page
module.exports.puppeteerOperation = async (playlistURL) => {
    try {
        // initializing puppeteer instance
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--proxy-server=http://14.140.131.82:3128"],
        });
        // navigate to the playlist page
        const page = await browser.newPage();
        // set user agent (override the default headless User Agent)
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        // navigating to playlist page and waiting till the page loads
        await page.goto(playlistURL, {
            waitUntil: "networkidle2",
            timeout: 0
        });
        // getting html content of the page
        const html = await page.content();
        // close the page
        browser.close();
        // returning the html content
        return html;
    } catch (err) {
        console.log("Error in getting html content " + err);
        return null;
    }
};