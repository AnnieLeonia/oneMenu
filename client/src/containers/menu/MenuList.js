import { connect } from "react-redux";
import { filter, flow, forEach, sortBy } from "lodash/fp";

import { toggleDishInactive } from "../../actions/dishes";
import DishList from "../../components/DishList";

const BASE_YEAR = 2020;

const seededShuffle = (array, seed) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const shuffleDishesForWeek = (dishes, week, year, dayId) => {
  if (dishes.length === 0) return [];

  const totalWeeks = (year - BASE_YEAR) * 52 + week;
  const seed = totalWeeks * 1000 + dayId;

  return seededShuffle(dishes, seed);
};

const mapItems = (state, week, year) => {
  const menuDays = state.menuDays.reduce((map, day) => {
    map[day.id] = { ...day, value: day.name, items: [] };
    return map;
  }, {});

  flow(
    sortBy(({ name }) => [name.toLowerCase()]),
    filter((dish) =>
      `${dish.name}-${dish.description}`.match(new RegExp(state.search, "i"))
    ),
    forEach((dish) => {
      const menuDayId = dish.menuDayId;
      if (menuDayId) {
        const menuDay = menuDays[menuDayId];
        if (menuDay) {
          menuDay.items.push({
            ...dish,
            key: `${dish.id}-${menuDayId}`,
            checked: dish.active,
            value: dish.name,
          });
        }
      }
    })
  )(state.dishes);

  return Object.values(menuDays)
    .sort((a, b) => a.orderidx - b.orderidx)
    .map((day) => ({
      ...day,
      items: shuffleDishesForWeek(day.items, week, year, day.id),
    }));
};

const mapStateToProps = (state, { week, year }) => ({
  items: mapItems(state, week, year),
  checked: [],
  linkTo: (id) => `/dishes/edit/${id}`,
  backUrl: "/menu",
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishList);
