module.exports = (app, passport, { Chef }) => {
  const isLoggedIn = (req, res, next) => {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    return res.sendStatus(401);
  };

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

  app.get("/auth/logout", (req, res) => {
    req.logout();
    req.session = null;
    res.clearCookie("connect.sid");
    res.redirect("/");
  });

  app.get("/auth/me", (req, res) => res.send(req.user));

  app.get("/api", (req, res) => res.send("Hello Server!"));

  app.get("/api/chefs", isLoggedIn, async (req, res) => {
    const chefs = await Chef.findAll();
    res.send(chefs);
  });
};
