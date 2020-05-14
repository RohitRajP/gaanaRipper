// importing required packages
const express = require("express");
const bodyParser = require("body-parser");
const configVars = require("./config/configVars");
const mongoose = require("mongoose");

// importing requiried routes
const fetchSongs = require("./routes/fetchSongs");

// initiating middlewares
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.json());

// declaring global routes
app.use("/fetchsongs", fetchSongs);


app.listen(4000);