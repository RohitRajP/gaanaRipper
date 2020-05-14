// importing required packages
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const crypto = require("crypto");


// gets the html content of the playlist page
const getHTMLContent = async (playlistURL) => {
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
    console.log("Puppeteer Error");

  }
};

// fetches the gaana song list
exports.fetchGannaSongs = async (req, res, next) => {

  const playlistURL = req.body["playlistURL"];
  console.log(playlistURL);

  // getting html content from the playlist url
  const htmlContent = await getHTMLContent(playlistURL);

  res.send({
    status: true,
    htmlContent: htmlContent
  });

};