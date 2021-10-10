import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import {
  filter,
  flow,
  map,
  sortBy,
} from 'lodash/fp';

import {
  toggleDishInactive,
} from '../../actions/dishes';
import RecipeList from '../../components/RecipeList';

// TODO: Move some of this logic to a helpers function

const active = ({ user, ...state }) => {
  return flow(
    filter('active'),
    map(dish => ({
      ...dish,
      value: dish.name,
    })),
    sortBy(({ name, uid }) => [name.toLowerCase(), uid]),
  )(state.dishes);
};

const mapStateToProps = state => ({
  active: active(state),
  translate: getTranslate(state.locale),
  linkTo: id => `/dishes/${id}`,
  backUrl: '/',
  isLoggedIn: !!state.user.email,
});

const mapDispatchToProps = {
  onItemClick: toggleDishInactive,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeList);
