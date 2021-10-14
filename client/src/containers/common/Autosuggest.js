import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import {
  filter,
  flow,
  sortBy,
  forEach,
  values
} from 'lodash/fp';

import Autosuggest from '../../components/Autosuggest';

// TODO: Move some of this logic to a helpers function

const getSuggestions = (value, state) => {
  const search = ({ name }) => name.match(new RegExp(value, 'i'));

  const uncategorized = getTranslate(state.locale)("categories.uncategorized");
  const categories = state.categories.reduce(
    (map, category) => {
      map[category.id] = { ...category, title: category.name, suggestions: [] };
      return map;
    },
    { null: { id: 0, title: uncategorized, orderidx: 0, suggestions: [] } }
  );

  flow(
    filter(search),
    sortBy(({ name }) => [name.toLowerCase()]),
    forEach((dish) => {
      (dish.categoryIds || []).forEach((categoryId) => {
        const category = categories[categoryId];
        if (category)
          category.suggestions.push({
            ...dish,
            key: `${dish.id}-${categoryId}`,
            checked: dish.active,
            value: dish.name,
          });
      });
    })
  )(state.dishes);

  return flow(values, filter("suggestions.length"), sortBy("orderidx"))(categories);
};

const mapStateToProps = state => ({
  getSuggestions: value => getSuggestions(value, state),
});

export default connect(mapStateToProps)(Autosuggest);
