module.exports = ({ app, db, isLoggedIn }) => {
  const User = require("./user-model")(db);

  /**
   * @swagger
   * /user:
   *   get:
   *     summary: Get your user
   *     tags:
   *       - User
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */

  app.get("/__/user", (req, res) => {
    const { user = {} } = req;
    if (!req.isAuthenticated()) return res.send({ isAuthenticated: false });

    return res.send(user);
  });

  /**
   * @swagger
   * /user:
   *   put:
   *     summary: Update your user
   *     tags:
   *       - User
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */

  app.put("/__/user", isLoggedIn, async (req, res, next) => {
    const { user: req_user = {} } = req;
    const { user, err } = await User.update(req_user.id, req.body);
    if (err) return next(err);
    if (!user) return res.sendStatus(404);
    return res.send(user);
  });

  /**
   * @swagger
   * /user:
   *   delete:
   *     summary: Delete your user
   *     tags:
   *       - User
   */

  app.delete("/__/user", isLoggedIn, async (req, res, next) => {
    const { user: req_user = {} } = req;
    const { user, err } = await User.delete(req_user.id);
    if (err) return next(err);
    if (!user) return res.sendStatus(404);
    return res.send(user);
  });

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     tags:
   *       - User
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *               minItems: 3
   */

  app.get("/__/users", isLoggedIn, async (_, res, next) => {
    const { users, err } = await User.getAll();
    if (err) return next(err);
    return res.send(users);
  });

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get a user
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */

  app.get("/__/users/:id", isLoggedIn, async (req, res, next) => {
    const { params = {} } = req;
    const { user, err } = await User.getById(params.id);

    if (err) return next(err);
    if (!user) return res.sendStatus(404);
    return res.send(user);
  });
};
