const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

module.exports = (passport, { Chef }) => {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function(id, done) {
    const user = await Chef.findByPk(id);
    done(null, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },

      async function(accessToken, refreshToken, profile, done) {
        const chef = await Chef.findOne({
          where: {
            email: profile.emails[0].value
          }
        });
        if (chef) return done(null, chef);
        return done(null, false, "Åtkomst nekad.");
      }
    )
  );
};
