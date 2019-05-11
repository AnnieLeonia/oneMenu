const Sequelize = require("sequelize");
const { Op } = Sequelize;
const operatorsAliases = {
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $and: Op.and,
  $or: Op.or
};

const sequelize = new Sequelize(process.env.DATABASE_URL, { operatorsAliases });

const Chef = sequelize.define("chef", {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  photo: Sequelize.STRING
});

const Day = sequelize.define("day", {
  name: Sequelize.STRING,
  weekday: Sequelize.INTEGER
});

const Dish = sequelize.define("dish", {
  name: Sequelize.STRING,
  date: Sequelize.DATE
});

const Sidetype = sequelize.define("sidetype", {
  name: Sequelize.STRING
});

const Side = sequelize.define("side", {
  name: Sequelize.STRING
});

Chef.hasMany(Day);
Day.belongsTo(Chef);

Day.hasMany(Dish);
Dish.belongsTo(Day);

Sidetype.hasMany(Side);
Side.belongsTo(Sidetype);

Dish.hasMany(Side);
Side.belongsTo(Dish);

module.exports = { sequelize, Chef, Day, Dish, Sidetype, Side };
