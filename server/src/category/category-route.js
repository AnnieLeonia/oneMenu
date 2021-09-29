module.exports = ({ app, db, isLoggedIn }) => {
  const Category = require("./category-model")(db);

  app.get("/__/categories", isLoggedIn, async (req, res, next) => {
    const { categories, err } = await Category.getAll();
    if (err) return next(err);
    return res.send(categories);
  });

  app.post("/__/categories", isLoggedIn, async (req, res, next) => {
    const { category, err } = await Category.create(req.body);
    if (err) return next(err);
    return res.send(category);
  });

  app.put("/__/categories/:id", isLoggedIn, async (req, res, next) => {
    const { category, err } = await Category.update(req.params.id, req.body);
    if (err) return next(err);
    return res.send(category);
  });

  app.delete("/__/categories/:id", isLoggedIn, async (req, res, next) => {
    const { category, err } = await Category.delete(req.params.id);
    if (err) return next(err);
    return res.send(category);
  });

  app.put("/__/categories_reorder", isLoggedIn, async (req, res, next) => {
    const { err } = await Category.reorder(req.body);
    if (err) return next(err);
    return res.sendStatus(200);
  });
};
