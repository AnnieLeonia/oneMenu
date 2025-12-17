import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { filter, flow, forEach, sortBy } from "lodash/fp";

import { toggleDishInactive } from "../../actions/dishes";
import DishList from "../../components/DishList";

const mapItems = (state) => {
  // Create a map of menu days with their dishes
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
      (dish.menuDayIds || []).forEach((menuDayId) => {
        const menuDay = menuDays[menuDayId];
        if (menuDay) {
          menuDay.items.push({
            ...dish,
            key: `${dish.id}-${menuDayId}`,
            checked: dish.active,
            value: dish.name,
          });
        }
      });
    })
  )(state.dishes);

  // Return all menu days sorted by orderidx (show empty days too for weekly menu view)
  return Object.values(menuDays).sort((a, b) => a.orderidx - b.orderidx);
};

const mapStateToProps = (state) => ({
  items: mapItems(state),
  checked: [],
  translate: getTranslate(state.locale),
  linkTo: (id) => `/dishes/edit/${id}`,
  backUrl: "/menu",
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishList);
