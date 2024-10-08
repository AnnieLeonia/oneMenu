const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

module.exports = (passport, db) => {
  const User = require("./src/user/user-model")(db);

  // used to serialize the user for the session
  passport.serializeUser((user, done) => done(null, user.id));

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    const { user, err } = await User.getById(id);
    if (err) return done(err);
    if (!user) return done(null, false, { message: "User not found" });
    return done(err, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
      (token, refreshToken, profile, done) => {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(async () => {
          const email = get(["emails", 0, "value"], profile); // pull the first email
          const name = get(["displayName"], profile);
          const photo = get(["photos", 0, "value"], profile);

          const { user, err } = await User.getByEmail(email);
          if (err) return done(err);

          if (user) {
            await User.update(user.id, { name, photo });
            // all is well, return successful user
            return done(null, user);
          }

          // if there is no user with that email
          // deny the login
          return done(null, false, { message: "User not found" });
        });
      }
    )
  );
};
