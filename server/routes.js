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

  app.get("/api/chefs", isLoggedIn, async (req, res) => {
    const chefs = await Chef.findAll();
    res.send(chefs);
  });

  app.get("/api/days", isLoggedIn, async (req, res) => {
    const days = await Day.findAll({
      order: ["weekday"],
      attributes: ["id", "name", "weekday"]
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
    const { name, date, dayId, sides } = req.body;
    const dish = await Dish.create(
      { name, date, dayId, sides },
      { include: [Side] }
    );
    res.send(dish);
  });

  app.get("/api/menus/:date", isLoggedIn, async (req, res) => {
    const { date } = req.params;

    const rawDishes = await Dish.findAll({
      attributes: ["id", "name", "date"],
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

    const dishes = rawDishes.map(({ id, name, date, day, sides }) => ({
      id,
      dish: name,
      date: moment(date).format("YYYY-MM-DD"),
      day: day.name,
      sides: sides.map(({ name, sidetype }) => ({
        side: name,
        sidetype: sidetype && sidetype.name
      }))
    }));

    res.send(dishes);
  });
};
