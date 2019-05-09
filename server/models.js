const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL);

const Chef = sequelize.define("chef", {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  photo: Sequelize.STRING,
  language: Sequelize.STRING
});

const Day = sequelize.define("day", {
  name: Sequelize.INTEGER,
  weekday: Sequelize.INTEGER
});

Day.belongsTo(Chef);

const Dish = sequelize.define("dish", {
  name: Sequelize.STRING,
  date: Sequelize.STRING
});

Dish.belongsTo(Day);

const Sidetype = sequelize.define("sidetype", {
  name: Sequelize.STRING
});

const Side = sequelize.define("side", {
  name: Sequelize.STRING
});

Side.belongsTo(Sidetype);
Side.belongsTo(Dish);

module.exports = { Chef, Day, Dish, Sidetype, Side };
