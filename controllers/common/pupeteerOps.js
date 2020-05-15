// importing required packages
const puppeteer = require("puppeteer");

// gets the html content of the playlist page
module.exports.puppeteerOperation = async (playlistURL) => {
    try {
        // initializing puppeteer instance
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        // navigate to the playlist page
        const page = await browser.newPage();
        // navigating to playlist page and waiting till the page loads
        await page.goto(playlistURL, {
            waitUntil: "networkidle2"
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