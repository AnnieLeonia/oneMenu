const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const { find } = require("lodash");
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

const sequelize = new Sequelize(
  process.env.SEQUELIZE_DB,
  process.env.SEQUELIZE_USERNAME,
  process.env.SEQUELIZE_PASSWORD,
  {
    host: process.env.SEQUELIZE_HOST,
    dialect: "postgres",
    operatorsAliases: false
  }
);

const Chef = sequelize.define("chef", {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  photo: Sequelize.STRING,
  language: Sequelize.STRING
});

passport.serializeUser(function(user, done) {
  done(null, user.name);
});

passport.deserializeUser(function(name, done) {
  done(null, { name });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async function(accessToken, refreshToken, profile, done) {
      const chefs = await Chef.findAll();
      const chef = find(chefs, { email: profile.emails[0].value });
      if (chef) {
        return done(null, chef);
      }
      return done({ success: false, message: "401 Unauthorized" });
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"] // ["https://www.googleapis.com/auth/plus.login"]
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.cookie("name", req.user.name);
    res.redirect("/");
  }
);

app.get("/auth/me", (req, res) => res.send(req.user));

app.get("/api", (req, res) => res.send("Hello Server!"));

app.get("/api/chefs", async (req, res) => {
  const chefs = await Chef.findAll();
  res.send(chefs);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

app.listen(3010, () => console.log("App is up and running!"));
