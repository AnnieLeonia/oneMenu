module.exports = (app, passport, models) => {
  const { sequelize, Chef, Day, Dish, Sidetype, Side } = models;

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

  app.get("/api/days", isLoggedIn, async (req, res) => {
    const days = await Day.findAll();
    res.send(days);
  });

  app.get("/api/sidetypes", isLoggedIn, async (req, res) => {
    const sidetypes = await Sidetype.findAll();
    res.send(sidetypes);
  });

  app.post("/api/dishes", isLoggedIn, async (req, res) => {
    const { name, date, dayId, sides } = req.body;
    let transaction, dish;

    try {
      // Get the transaction
      transaction = await sequelize.transaction();

      // Create the dish
      dish = await Dish.create({ name, date, dayId }, { transaction });

      // Create the sides
      for (const side of sides) {
        await Side.create(side, { transaction });
      }

      // Commit transaction
      await transaction.commit();
    } catch (err) {
      // Rollback transaction if any errors were encountered
      await transaction.rollback();
      return res.status(400).send(err);
    }

    return res.send(dish);
  });
};
