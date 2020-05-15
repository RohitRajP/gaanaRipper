// importing required packages
const puppeteerOps = require("./common/pupeteerOps");

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