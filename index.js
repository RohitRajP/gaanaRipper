// importing required packages
const express = require("express");
const bodyParser = require("body-parser");

// importing requiried routes
const fetchSongs = require("./routes/fetchSongs");

// initiating middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// declaring global routes
app.use("/fetchsongs", fetchSongs);

// starting server
app.listen(process.env.PORT || 4000);
