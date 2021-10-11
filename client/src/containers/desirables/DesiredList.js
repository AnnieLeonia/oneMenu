import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { filter, flow, map, sortBy } from "lodash/fp";

import RecipeList from "../../components/RecipeList";

const active = ({ user, ...state }) => {
  return flow(
    filter("active"),
    map((dish) => ({
      ...dish,
      value: dish.name,
    })),
    sortBy(({ name, uid }) => [name.toLowerCase(), uid])
  )(state.dishes);
};

const mapStateToProps = (state, props) => ({
  active: active(state),
  translate: getTranslate(state.locale),
  linkTo: (id) => `/dishes/${id}`,
  backUrl: "/",
  isLoggedIn: !!state.user.email,
});

export default connect(mapStateToProps)(RecipeList);
