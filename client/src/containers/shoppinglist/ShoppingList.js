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
  inactivateProducts,
  toggleProductInactive,
} from '../../actions/products';
import ProductList from '../../components/ProductList';

// TODO: Move some of this logic to a helpers function

const active = ({ user, ...state }) => {
  const uncategorized = getTranslate(state.locale)('categories.uncategorized');
  const getCategory = ({ categoryId }) => {
    return get('name', find({ id: toInteger(categoryId) }, state.categories))
  };

  return flow(
    filter('active'),
    map(product => ({
      ...product,
      key: `${product.id}-${product.categoryId}`,
      categoryName: getCategory(product),
    })),
    sortBy(({ name, uid }) => [name.toLowerCase(), uid]),
    groupBy('categoryName'),
    mergeWith((category, products) => ({
      ...category,
      value: getOr(uncategorized, 'name', category),
      orderidx: getOr(0, 'orderidx', category),
      items: map(product => ({ ...product, value: product.name }), products),
    }))(zipObject(map('name', state.categories), state.categories)),
    filter('items.length'),
    sortBy('orderidx')
  )(state.products);
};

const mapStateToProps = state => ({
  active: active(state),
  translate: getTranslate(state.locale),
  linkTo: id => `/products/${id}`,
  backUrl: '/',
  isLoggedIn: !!state.user.email,
  getData: (item) => ({ ...item, userId: state.user.isCollaboration ? 0 : state.user.id || 0 }),
});

const mapDispatchToProps = {
  onItemClick: toggleProductInactive,
  onDoneClick: inactivateProducts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
