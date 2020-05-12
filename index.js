// importing required packages
const express = require("express");
const bodyParser = require("body-parser");
const configVars = require("./config/configVars");
const mongoose = require("mongoose");

// importing requiried routes
const fetchSongs = require("./routes/fetchSongs");

// initiating middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// declaring global routes
app.use("/fetchsongs", fetchSongs);

// connection to database, and only then starting the application
mongoose
  .connect(configVars.mongoDbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 4000);
    console.log("Server started and database connection established");
  })
  .catch((err) => {
    console.log("Database Connection error: " + err);
  });
