// importing required packages
const mongoose = require("mongoose");
const md5 = require("md5");

// importing required models
const RipperCollection = require("../../models/ripperCollection");

// deletes the requested gaana collection doc from database
module.exports.deleteGaanaDoc = async (req, res, next) => {
  // computing the required hash
  const hashedAlbumURL = md5(req.body["playlistURL"]);

  // deleting the required document
  await RipperCollection.findOneAndRemove(
    { ripId: hashedAlbumURL },
    (err, doc) => {
      if (err) {
        console.log("Error in deleting document");
        res.send({
          status: false,
          error: "Error occurred in deleting the document",
        });
      } else if (doc != null) {
        console.log("Document deleted");
        res.send({ status: true, error: "Playlist deleted successfully" });
      } else {
        console.log("No document found");
        res.send({ status: false, error: "Playlist not found in database" });
      }
    }
  );
};
