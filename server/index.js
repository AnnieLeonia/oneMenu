const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
require("dotenv").config();

const app = express();

app.use(express.static(path.resolve(__dirname, "..", "dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

const models = require("./models");

require("./passport")(passport, models);
require("./routes")(app, passport, models);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

app.listen(3010, () => console.log("App is up and running!"));
