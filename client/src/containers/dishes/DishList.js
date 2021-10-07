import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import {
  filter,
  find,
  flow,
  get,
  getOr,
  groupBy,
  map,
  mergeWith,
  sortBy,
  toInteger,
  zipObject,
} from 'lodash/fp';

import { toggleDishInactive } from '../../actions/dishes';
import DishList from '../../components/DishList';

// TODO: Move some of this logic to a helpers function

const active = (state) => {
  const userId = state.user.isCollaboration ? 0 : state.user.id || 0;
  const uncategorized = getTranslate(state.locale)('categories.uncategorized');
  const getCategory = ({ categoryId }) => {
    return get('name', find({ id: toInteger(categoryId) }, state.categories))
  };

  return flow(
    map(dish => ({
      ...dish,
      key: `${dish.id}-${dish.categoryId}`,
      checked: dish.active,
      categoryName: getCategory(dish),
    })),
    sortBy(({ name, uid }) => [name.toLowerCase(), uid !== userId]),
    groupBy('categoryName'),
    mergeWith((category, dishes) => ({
      ...category,
      value: getOr(uncategorized, 'name', category),
      orderidx: getOr(0, 'orderidx', category),
      items: map(dish => ({ ...dish, value: dish.name }), dishes),
    }))(zipObject(map('name', state.categories), state.categories)),
    filter('items.length'),
    sortBy('orderidx')
  )(state.dishes);
};

const mapStateToProps = state => ({
  active: active(state),
  checked: [],
  translate: getTranslate(state.locale),
  linkTo: id => `/dishes/${id}`,
  backUrl: '/dishes',
  getData: (item) => ({ ...item, userId: state.user.isCollaboration ? 0 : state.user.id || 0 }),
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
  onDoneClick: () => null,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DishList);
