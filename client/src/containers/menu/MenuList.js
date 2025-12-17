import { connect } from "react-redux";
import { filter, flow, forEach, sortBy } from "lodash/fp";

import { toggleDishInactive } from "../../actions/dishes";
import DishList from "../../components/DishList";

const DISHES_PER_DAY = 3;
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

const getRotationDishes = (dishes, week, year, dayId) => {
  if (dishes.length === 0) return [];
  if (dishes.length <= DISHES_PER_DAY) return dishes;

  const totalWeeks = (year - BASE_YEAR) * 52 + week;

  const weeksPerCycle = Math.ceil(dishes.length / DISHES_PER_DAY);
  const cycleNumber = Math.floor(totalWeeks / weeksPerCycle);
  const weekInCycle = totalWeeks % weeksPerCycle;

  const seed = cycleNumber * 1000 + dayId;
  const shuffled = seededShuffle(dishes, seed);

  const start = weekInCycle * DISHES_PER_DAY;
  const primary = shuffled.slice(start, start + DISHES_PER_DAY);

  if (primary.length < DISHES_PER_DAY) {
    const primaryIds = new Set(primary.map((d) => d.id));
    const others = shuffled.filter((d) => !primaryIds.has(d.id));
    const fillSeed = seed + totalWeeks;
    const fillShuffled = seededShuffle(others, fillSeed);
    primary.push(...fillShuffled.slice(0, DISHES_PER_DAY - primary.length));
  }

  return primary;
};

const mapItems = (state, week, year, showAll) => {
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
      items: showAll
        ? day.items
        : getRotationDishes(day.items, week, year, day.id),
    }));
};

const mapStateToProps = (state, { week, year, showAll }) => ({
  items: mapItems(state, week, year, showAll),
  checked: [],
  linkTo: (id) => `/dishes/edit/${id}`,
  backUrl: "/menu",
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishList);
