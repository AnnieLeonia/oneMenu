module.exports = ({ app, db, isLoggedIn }) => {
  const Dish = require("./dish-model")(db);

  app.get("/__/dishes", isLoggedIn, async (req, res, next) => {
    const { dishes, err } = await Dish.getAll();
    if (err) return next(err);
    return res.send(dishes);
  });

  app.post("/__/dishes", isLoggedIn, async (req, res, next) => {
    const { dish, err } = await Dish.create(req.body);
    if (err) return next(err);
    return res.send(dish);
  });

  app.get("/__/dishes/:id", isLoggedIn, async (req, res, next) => {
    const { dish, err } = await Dish.getById(req.params.id);
    if (err) return next(err);
    if (!dish) return res.status(404).send({ message: "Dish not found" });
    return res.send(dish);
  });

  app.put("/__/dishes/:id", isLoggedIn, async (req, res, next) => {
    let response;
    if (req.get("Type") === "toggle-active") {
      response = await Dish.toggleActive(req.params.id);
    } else {
      response = await Dish.update(req.params.id, req.body);
    }
    const { dish, err } = response;
    if (err) return next(err);
    return res.send(dish);
  });

  app.delete("/__/dishes/:id", isLoggedIn, async (req, res, next) => {
    const { dish, err } = await Dish.delete(req.params.id);
    if (err) return next(err);
    return res.send(dish);
  });
};
