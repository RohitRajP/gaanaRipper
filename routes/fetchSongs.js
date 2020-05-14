// importing required packages
const express = require("express");

// initiating router instance
const router = express.Router();

// importing required controllers
const fetchGannaController = require("../controllers/fetchGaana/fetchGaana");
const deleteGannaController = require("../controllers/fetchGaana/deleteGaanaDoc");

// declaring required routes
router.post("/gaana", fetchGannaController.fetchGannaSongs);
// router.delete("/gaana", deleteGannaController.deleteGaanaDoc);

module.exports = router;