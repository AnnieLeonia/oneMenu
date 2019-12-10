const moment = require("moment");
const { Op } = require("sequelize");

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

  app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect(`/login?info=${info}`);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    })(req, res, next);
  });

  app.get("/auth/logout", (req, res) => {
    req.logout();
    req.session = null;
    res.clearCookie("session");
    res.redirect("/");
  });

  app.get("/auth/me", (req, res) => res.send(req.user || {}));

  app.get("/api/chefs", isLoggedIn, async (req, res) => {
    const chefs = await Chef.findAll();
    res.send(chefs);
  });

  app.get("/api/days/:weekday", isLoggedIn, async (req, res) => {
    const { weekday } = req.params;

    const days = await Day.findAll({
      order: ["name"],
      attributes: ["id", "name"],
      where: { weekday }
    });
    res.send(days);
  });

  app.get("/api/sidetypes", isLoggedIn, async (req, res) => {
    const sidetypes = await Sidetype.findAll({
      order: ["name"],
      attributes: ["id", "name"]
    });
    res.send(sidetypes);
  });

  app.post("/api/dishes", isLoggedIn, async (req, res) => {
    const { name, date, isSkipped, dayId, sides } = req.body;

    await Dish.destroy({
      where: sequelize.where(
        sequelize.fn("date", sequelize.col("date")),
        "=",
        date
      )
    });

    const dish = await Dish.create(
      { name, date, isSkipped, dayId, sides },
      { include: [Side] }
    );

    res.send(dish);
  });

  app.get("/api/dishes/:date", isLoggedIn, async (req, res) => {
    const { date } = req.params;

    const dish = await Dish.findOne({
      where: sequelize.where(
        sequelize.fn("date", sequelize.col("date")),
        "=",
        date
      ),
      include: [
        {
          model: Side,
          attributes: ["name"],
          include: [{ model: Sidetype, attributes: ["id"] }]
        }
      ]
    });

    if (dish) dish.sides.forEach(side => (side.sidetypeId = side.sidetype.id));

    res.send(dish || {});
  });

  app.delete("/api/dishes/:date", isLoggedIn, async (req, res) => {
    const { date } = req.params;

    const dish = await Dish.destroy({
      where: sequelize.where(
        sequelize.fn("date", sequelize.col("date")),
        "=",
        date
      )
    });

    res.send({});
  });

  app.get("/api/menus/:date", isLoggedIn, async (req, res) => {
    const { date } = req.params;

    const dishes = await Dish.findAll({
      attributes: ["id", "name", "date", "isSkipped"],
      order: ["date"],
      where: {
        date: {
          [Op.between]: [moment(date), moment(date).add(5, "days")]
        }
      },
      include: [
        { model: Day, attributes: ["name"] },
        {
          model: Side,
          attributes: ["name"],
          include: [{ model: Sidetype, attributes: ["name"] }]
        }
      ]
    });

    const menu = dishes.map(({ id, name, date, isSkipped, day, sides }) => ({
      id,
      dish: name,
      date: moment(date).format("YYYY-MM-DD"),
      day: day && day.name,
      isSkipped,
      sides: sides.map(({ name, sidetype }) => ({
        side: name,
        sidetype: sidetype && sidetype.name
      }))
    }));

    res.send(menu);
  });
};
