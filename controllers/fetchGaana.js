// importing required packages
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");

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

// gets the audio song titles from the html document and album title
const getAlbumInfo = async (htmlContent) => {
  // loading html content into cheerio
  const $ = cheerio.load(htmlContent);
  // fetching the album title
  let albumTitle = $("._d_tp_det").find("h1").text();
  // checking if albumTitle returned empty (if this is a trending list)
  if (albumTitle.length === 0) {
    albumTitle = $(".trendingtitle").text();
  }
  // holds the list of song titles
  const songTitles = [];
  // fetching all Divs containing all songs
  const songDivs = $(".content-container").find(".track_npqitemdetail");
  // iterating through each div
  songDivs.each((i, songDiv) => {
    songTitles.push($(songDiv).find("span").text());
  });
  // creating album object
  const albumObj = { albumTitle: albumTitle };
  // pushing album songs into albumObj
  albumObj["songTitles"] = songTitles;
  return albumObj;
};

// gets the ytCat objects for all songs
const getYTCatObjs = async (audioTitles, res) => {
  // holds the list of YTCatObjects
  const ytCatObjs = [];

  // iterating through each audioTitle
  for (const audioTitle of audioTitles) {
    // run till error is returned or the value is fetched
    while (true) {
      console.log("GETTING " + audioTitle);
      try {
        // sending ytCat request
        let ytCatResponse = await axios.get(
          "https://staging-api.openbeats.live/ytcat?q=" +
            audioTitle +
            " audio&fr=true"
        );
        // cheking for response status
        if (ytCatResponse.status === 200) {
          // checking if data is returned
          if (ytCatResponse.data["data"].length > 0) {
            console.log("GOT", "\n");
            // pushing data into list
            ytCatObjs.push(ytCatResponse.data["data"][0]);
            break;
          } else {
            console.log("Returned NULL... Retrying");
          }
        } else {
          break;
        }
      } catch (err) {
        res.send({
          status: false,
          error: audioTitle + " " + err,
        });
        break;
      }
    }
  }

  // returning the object containing all the song objects
  return ytCatObjs;
};

// fetches the gaana song list
exports.fetchGannaSongs = async (req, res, next) => {
  try {
    // getting the playlist url
    const playlistURL = req.body["playlistURL"];
    // getting html content from the playlist url
    const htmlContent = await getHTMLContent(playlistURL);
    // getting the list of audio titles and album title
    const albumObj = await getAlbumInfo(htmlContent);
    //  gets the ytCat objects for all songs
    const ytCatObjs = await getYTCatObjs(albumObj["songTitles"], res);
    // sending final response
    res.send({
      status: true,
      albumTitle: albumObj["albumTitle"],
      audioTitlesInGaana: albumObj["songTitles"].length,
      audioObjsFetched: ytCatObjs.length,
      data: ytCatObjs,
    });
  } catch (err) {
    // sending error response
    res.send({ status: false, error: err });
  }
};
