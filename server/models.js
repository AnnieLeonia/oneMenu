const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL);

const Chef = sequelize.define("chef", {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  photo: Sequelize.STRING,
  language: Sequelize.STRING
});

const Day = sequelize.define("day", {
  name: Sequelize.STRING,
  weekday: Sequelize.INTEGER
});

const Dish = sequelize.define("dish", {
  name: Sequelize.STRING,
  date: Sequelize.STRING
});

const Sidetype = sequelize.define("sidetype", {
  name: Sequelize.STRING
});

const Side = sequelize.define("side", {
  name: Sequelize.STRING
});

Day.belongsTo(Chef);
Dish.belongsTo(Day);
Side.belongsTo(Sidetype);
Side.belongsTo(Dish);

module.exports = { sequelize, Chef, Day, Dish, Sidetype, Side };
