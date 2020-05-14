// importing required packages
const crypto = require("crypto");

// importing required models
const RipperCollection = require("../../models/ripperCollection");

// deletes the requested gaana collection doc from database
module.exports.deleteGaanaDoc = async (req, res, next) => {
  // computing the required hash
  const hashedAlbumURL = crypto
    .createHash("md5")
    .update(req.body["playlistURL"])
    .digest("hex");

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
