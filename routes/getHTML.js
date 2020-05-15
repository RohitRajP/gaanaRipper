// importing required packages
const express = require("express");

// initiating router instance
const router = express.Router();

// importing required controllers
const getHTMLController = require("../controllers/getHTML");
const scrapGaanaController = require("../controllers/scrapGaana");

// declaring required routes
router.get("/gethtml", getHTMLController.getHTMLContent);
router.get("/scrapgaana", scrapGaanaController.getHTMLContent);

// exporting router
module.exports = router;