// importing required packages
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");

// gets the html content of the playlist page
const getHTMLContent = async (playlistURL) => {
  // initializing puppeteer instance
  const browser = await puppeteer.launch();
  // navigate to the playlist page
  const page = await browser.newPage();
  // navigating to playlist page and waiting till the page loads
  await page.goto(playlistURL, { waitUntil: "networkidle2" });
  // getting html content of the page
  const html = await page.content();
  // close the page
  browser.close();
  // returning the html content
  return html;
};

// gets the audio song titles from the html document
const getAudioTitles = async (htmlContent) => {
  // loading html content into cheerio
  const $ = cheerio.load(htmlContent);
  // fetching the album title
  const albumTitle = $("._d_tp_det").find("h1").text();
  console.log(albumTitle);
  return true;
};

// fetches the gaana song list
exports.fetchGannaSongs = async (req, res, next) => {
  // getting the playlist url
  const playlistURL = req.body["playlistURL"];
  // getting html content from the playlist url
  const htmlContent = await getHTMLContent(playlistURL);
  // getting the list of audio titles
  const audioTitles = await getAudioTitles(htmlContent);
  res.send({ status: true, htmlContent: htmlContent });
};
