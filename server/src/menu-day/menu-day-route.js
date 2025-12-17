module.exports = ({ app, db }) => {
  const MenuDay = require("./menu-day-model")(db);

  app.get("/__/menu-days", async (req, res, next) => {
    const { menuDays, err } = await MenuDay.getAll();
    if (err) return next(err);
    return res.send(menuDays);
  });
};
