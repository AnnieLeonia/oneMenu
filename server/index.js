const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
require("dotenv").config();

const app = express();

app.use(express.static(path.resolve(__dirname, "..", "dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  httpOnly: true,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  maxAge: 30 * 24 * 60 * 60 * 1000, // one month
}));
app.use(passport.initialize());
app.use(passport.session());

const models = require("./models");

require("./passport")(passport, models);
require("./routes")(app, passport, models);

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

app.listen(3010, () => console.log("App is up and running!"));
