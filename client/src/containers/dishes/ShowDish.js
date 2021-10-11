import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { find, get, toInteger } from "lodash/fp";

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

const ShowDish = ({ name, description, translate, history, location }) => (
  <div className="dish">
    <div className="title">{name}</div>
    <div className="wrapper">
      <div>{description}</div>
      <button
        className="cancelBtn"
        type="button"
        onClick={() => redirect(history, location)}
      >
        {translate("dishes.back")}
      </button>
    </div>
  </div>
);

ShowDish.defaultProps = {
  name: "",
};

ShowDish.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  translate: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({
      backUrl: PropTypes.string,
    }),
  }).isRequired,
};

const mapStateToProps = (state, { match }) => {
  const id = toInteger(match.params.id);
  const dish = find({ id }, state.dishes);

  return {
    id,
    name: get("name", dish),
    description: get("description", dish),
    translate: getTranslate(state.locale),
  };
};

export default connect(mapStateToProps)(ShowDish);
