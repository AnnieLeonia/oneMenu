const express = require("express");
const session = require("cookie-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const { Client } = require("pg");
const passport = require("passport");

const app = express();
const port = 3010;
const { DATABASE_URL } = process.env;

// serve static react build
app.use(express.static(path.resolve(__dirname, "..", "dist")));

// connect to our database
// const client = new Client(DATABASE_URL);
// client.connect();

// load models
// const User = require('./models/user')(client);
// const Category = require('./models/category')(client);
// const Product = require('./models/product')(client);

// const db = { User, Category, Product };

// require('./passport')(passport, User);

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// required for passport
// const { SESSION_SECRET_KEY1, SESSION_SECRET_KEY2 } = process.env;

// app.use(
//   session({
//     name: 'session',
//     keys: [SESSION_SECRET_KEY1, SESSION_SECRET_KEY2],
//     // Cookie Options
//     httpOnly: true,
//     resave: false,
//     rolling: true,
//     saveUninitialized: false,
//     maxAge: 30 * 24 * 60 * 60 * 1000, // one month
//   })
// ); // session secret
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions

// routes
// require('./routes.js')(app, passport, db);

app.listen(port, () => console.log("OneMenu app listening on port 3010!"));
