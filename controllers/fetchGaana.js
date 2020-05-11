// importing required packages
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");

// gets the html content of the playlist page
const getHTMLContent = async (playlistURL, res) => {
  try {
    // initializing puppeteer instance
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
  } catch (err) {
    res.send({ status: false, error: "Puppeteer Error" });
  }
};

// get song list through non-film album method
const getSongLstNonFilmStructure = async ($) => {
  // holds the list of song titles
  const songsLst = [];
  // fetching all Divs containing all songs
  const songDivs = $(".content-container").find(".track_npqitemdetail");
  // iterating through each div
  songDivs.each((i, songDiv) => {
    // constains instance of each song
    let songObj = {};
    // getting the song title
    songObj["title"] = $(songDiv).find("span").text();
    // cycling through the artists and getting the first one
    $(songDiv)
      .find("a")
      .each(async (i, artistAnchor) => {
        songObj["artist"] = await $(artistAnchor).text();
      });
    // checking if the audio artist is undefined, which would mean this is a movie album and thus, the artist name is in different
    songsLst.push(songObj);
  });
  // returning songLst
  return songsLst;
};

// get song list through film album method
const getSongLstFilmStructure = async ($) => {
  // holds the list of song titles
  const songsLst = [];
  // getting to the unordered list containing all songs
  const allSongUL = await $(".content-container")
    .find(".s_c")
    .find("ul")
    .toArray()[1];

  // finding all the list items (songs in the unordered list)
  const songsLstItems = await $(allSongUL)
    .find('li[draggable="true"]')
    .toArray();

  // iterating through each song list item which contains multiple other list items
  for (const multiListItems of songsLstItems) {
    // constains instance of each song
    let songObj = {};
    // getting to the list item containing the song details
    let songDetailLstItem = await $(multiListItems).find("li").toArray()[2];
    // getting the song title stored in the 3rd list item
    songObj["title"] = await $(
      $(songDetailLstItem).find("a").toArray()[0]
    ).text();
    // getting the song artist stored in the 3rd list item
    songObj["artist"] = await $(
      $(songDetailLstItem).find("a").toArray()[1]
    ).text();

    // pushing song object into list
    songsLst.push(songObj);
  }

  // returning the song lst
  return songsLst;
};

// gets the audio song titles from the html document and album title
const getAlbumInfo = async (htmlContent, res) => {
  try {
    // loading html content into cheerio
    const $ = cheerio.load(htmlContent);
    // fetching the album title
    let albumTitle = $("._d_tp_det").find("h1").text();
    // checking if albumTitle returned empty (if this is a trending list)
    if (albumTitle.length === 0) albumTitle = $(".trendingtitle").text();
    // checking if the albumTitle is still empty (if this is a movie album)
    if (albumTitle.length === 0) albumTitle = $(".album_songheading").text();

    // try getting the song list through non-film album method
    let songsLst = await getSongLstNonFilmStructure($);

    // checking if the artists have been fetched (if the album is a film album)
    if (songsLst[0]["artist"] === undefined)
      songsLst = await getSongLstFilmStructure($);

    // creating album object
    const albumObj = { albumTitle: albumTitle };
    // pushing album songs into albumObj
    albumObj["songsLst"] = songsLst;
    return albumObj;
  } catch (err) {
    res.send({ status: false, error: "Error in getting album info" });
  }
};

// gets the ytCat objects for all songs
const getYTCatObjs = async (songLst, res) => {
  // holds the list of YTCatObjects
  const ytCatObjs = [];

  // iterating through each audioTitle
  for (const song of songLst) {
    // run till error is returned or the value is fetched
    while (true) {
      console.log(song);

      console.log("GETTING " + song["title"]);
      try {
        // setting up URL to ping
        let ytcatUrl =
          "https://staging-api.openbeats.live/ytcat?q=" +
          song["title"] +
          " " +
          song["artist"] +
          " audio&fr=true";
        console.log(ytcatUrl);
        // sending ytCat request
        let ytCatResponse = await axios.get(ytcatUrl);
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
    const htmlContent = await getHTMLContent(playlistURL, res);
    // getting the list of audio titles and album title
    const albumObj = await getAlbumInfo(htmlContent, res);
    //  gets the ytCat objects for all songs
    const ytCatObjs = await getYTCatObjs(albumObj["songsLst"], res);
    // sending final response
    res.send({
      status: true,
      albumTitle: albumObj["albumTitle"],
      audioTitlesInGaana: albumObj["songsLst"].length,
      audioObjsFetched: ytCatObjs.length,
      data: ytCatObjs,
    });
  } catch (err) {
    // sending error response
    res.send({ status: false, error: err, errorPos: "Main method throw" });
  }
};
