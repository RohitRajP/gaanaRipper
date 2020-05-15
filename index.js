// importing required packages
const express = require("express");

// importing requiried routes
const getHTMLRoute = require("./routes/getHTML");

// initiating middlewares
const app = express();

// declaring global routes
app.use("/", getHTMLRoute);

// listening to port
app.listen(process.env.PORT || 4000);

console.log("Server started and running on PORT", process.env.PORT || 4000);