// importing required packages
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const crypto = require("crypto");


// gets the html content of the playlist page
const puppeteerOperation = async (playlistURL) => {
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

// fetches the gaana song list
exports.getHTMLContent = async (req, res, next) => {

  try {
    // getting the url of playlist
    const playlistURL = req.query["playlisturl"];

    // log acknowlodgement of recieving playlistUrl
    console.log("PlaylistURL: ", playlistURL);

    if (playlistURL != null) {
      // getting html content from the playlist url
      const htmlContent = await puppeteerOperation(playlistURL);

      // checking for any mistake in getting html content
      if (htmlContent === null) {
        // sending back response
        res.send({
          status: false,
          error: "Please check playlist url"
        });
      } else {
        // log the process completion
        console.log("HTML data fetched");

        // sending back response
        res.send({
          status: true,
          htmlContent: htmlContent
        });
      }

    } else {
      // sending error response
      res.send({
        status: false,
        error: "No playlist URL recieved at server"
      });
    }
  } catch (err) {
    console.log("Error in getHTMLContent ", err);
    // sending error response
    res.send({
      status: false,
      error: "Error in getHTMLContent ",
      desc: err,
    });
  }

};