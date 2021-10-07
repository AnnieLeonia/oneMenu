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

import {
  inactivateDishes,
  toggleDishInactive,
} from '../../actions/dishes';
import DishList from '../../components/DishList';

// TODO: Move some of this logic to a helpers function

const active = ({ user, ...state }) => {
  const uncategorized = getTranslate(state.locale)('categories.uncategorized');
  const getCategory = ({ categoryId }) => {
    return get('name', find({ id: toInteger(categoryId) }, state.categories))
  };

  return flow(
    filter('active'),
    map(dish => ({
      ...dish,
      key: `${dish.id}-${dish.categoryId}`,
      categoryName: getCategory(dish),
    })),
    sortBy(({ name, uid }) => [name.toLowerCase(), uid]),
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
  translate: getTranslate(state.locale),
  linkTo: id => `/dishes/${id}`,
  backUrl: '/',
  isLoggedIn: !!state.user.email,
  getData: (item) => ({ ...item, userId: state.user.isCollaboration ? 0 : state.user.id || 0 }),
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
  onDoneClick: inactivateDishes,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DishList);
