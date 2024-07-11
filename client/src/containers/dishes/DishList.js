import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { filter, flow, forEach, sortBy, values } from "lodash/fp";

import { toggleDishInactive } from "../../actions/dishes";
import DishList from "../../components/DishList";

const mapItems = (state) => {
  const uncategorized = getTranslate(state.locale)("categories.uncategorized");

  const categories = state.categories.reduce(
    (map, category) => {
      map[category.id] = { ...category, value: category.name, items: [] };
      return map;
    },
    { null: { id: 0, value: uncategorized, orderidx: 0, items: [] } }
  );

  flow(
    sortBy(({ name }) => [name.toLowerCase()]),
    filter((dish) =>
      `${dish.name}-${dish.description}`.match(new RegExp(state.search, "i"))
    ),
    forEach((dish) => {
      (dish.categoryIds || []).forEach((categoryId) => {
        const category = categories[categoryId];
        if (category)
          category.items.push({
            ...dish,
            key: `${dish.id}-${categoryId}`,
            checked: dish.active,
            value: dish.name,
          });
      });
    })
  )(state.dishes);

  return flow(values, filter("items.length"), sortBy("orderidx"))(categories);
};

const mapStateToProps = (state) => ({
  items: mapItems(state),
  checked: [],
  translate: getTranslate(state.locale),
  linkTo: (id) => `/dishes/edit/${id}`,
  backUrl: "/",
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishList);
