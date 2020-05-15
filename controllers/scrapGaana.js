// importing required modules
const puppeteerOps = require("./common/pupeteerOps");
const cheerio = require("cheerio");

// get song list through non-film album method
const getSongLstNonFilmStructure = async ($) => {
    try {
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
    } catch (err) {
        console.log("Error in getSongLstNonFilmStructure" + err);
        return null;
    }
};

// get song list through film album method
const getSongLstFilmStructure = async ($) => {
    try {
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
    } catch (err) {
        console.log("Error in getSongLstFilmStructure" + err);
        return null;
    }
};

// gets the audio song titles from the html document and album title
const getAlbumInfo = async (htmlContent) => {
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
        const albumObj = {
            albumTitle: albumTitle
        };
        // pushing album songs into albumObj
        albumObj["songsLst"] = songsLst;

        // return the album object
        return albumObj;
    } catch (err) {
        console.log("Error in getting album info", err);
        // handling errors while also updating database
        return null;
    }
};


// fetches the gaana song list
exports.getHTMLContent = async (req, res, next) => {

    try {
        // getting the url of playlist after decoding it
        const playlistURL = decodeURI(req.query["playlisturl"]);

        // log acknowlodgement of recieving playlistUrl
        console.log("PlaylistURL: ", playlistURL);

        if (playlistURL != null) {
            // getting html content from the playlist url
            const htmlContent = await puppeteerOps.puppeteerOperation(playlistURL);

            // checking for any mistake in getting html content
            if (htmlContent === null) {

                // sending back response
                res.send({
                    status: false,
                    error: "Please send valid Playlist URL"
                });
            } else {
                // log the process completion
                console.log("HTML data fetched");

                // get the album information
                const albumObj = await getAlbumInfo(htmlContent);

                console.log("Parsing Completed");

                if (albumObj === null) {
                    // sending back response
                    res.send({
                        status: false,
                        error: "Could not get playlist information from HTML"
                    });
                } else {
                    // sending back response
                    res.send({
                        status: true,
                        albumObj: albumObj
                    });
                }


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