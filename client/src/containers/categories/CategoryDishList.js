import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { flow, forEach, sortBy } from "lodash/fp";

import { toggleDishInactive } from "../../actions/dishes";
import DishList from "../../components/DishList";

const active = (state, categoryId) => {
  const [category] = state.categories.filter(
    (category) => category.id === categoryId
  );
  const items = [];
  if (!category) {
    return [
      { value: getTranslate(state.locale)("categories.nonexistent"), items },
    ];
  }

  flow(
    sortBy(({ name }) => [name.toLowerCase()]),
    forEach((dish) => {
      (dish.categoryIds || []).forEach((_categoryId) => {
        if (_categoryId === categoryId)
          items.push({
            ...dish,
            key: dish.id,
            checked: dish.active,
            value: dish.name,
          });
      });
    })
  )(state.dishes);

  return [{ ...category, value: category.name, items }];
};

const mapStateToProps = (state, { match }) => ({
  active: active(state, Number(match.params.id)),
  checked: [],
  translate: getTranslate(state.locale),
  linkTo: (id) => `/dishes/edit/${id}`,
  backUrl: "/dishes",
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishList);
