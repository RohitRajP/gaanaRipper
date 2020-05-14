// importing required packages
const express = require("express");

// initiating router instance
const router = express.Router();

// importing required controllers
const getHTMLController = require("../controllers/getHTML");

// declaring required routes
router.get("/gethtml", getHTMLController.getHTMLContent);

// exporting router
module.exports = router;