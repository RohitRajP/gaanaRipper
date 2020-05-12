// importing required packages
const express = require("express");

// initiating router instance
const router = express.Router();

// importing required controllers
const fetchGannaController = require("../controllers/fetchGaana/fetchGaana");

// declaring required routes
router.post("/gaana", fetchGannaController.fetchGannaSongs);

module.exports = router;
