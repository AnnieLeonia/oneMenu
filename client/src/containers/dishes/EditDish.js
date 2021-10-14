import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { get, toInteger } from "lodash/fp";

import {
  fetchDish,
  editDish,
  removeDish,
  resetDish,
} from "../../actions/dishes";
import CategorySelect from "./CategorySelect";

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

class EditDish extends Component {
  componentDidMount() {
    const { dish } = this.props;
    this.props.getDish(dish.id);
  }

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const { dish, translate, history, location } = this.props;
    const { onRemove, onSubmit } = this.props;

    return (
      <div className="dish">
        <div className="title">
          <b>{translate("edit.edit")}: </b>
          {dish.name}
        </div>
        <div className="wrapper">
          <form onSubmit={(evt) => onSubmit(evt, dish.id, history, location)}>
            <label htmlFor="dishName">
              <span>{translate("edit.name")}:</span>
              <input
                id="dishName"
                name="dishName"
                autoComplete="off"
                defaultValue={dish.name}
              />
            </label>
            <label htmlFor="dishDescription">
              <span>{translate("edit.description")}:</span>
              <textarea
                id="dishDescription"
                name="dishDescription"
                autoComplete="off"
                defaultValue={dish.description}
              />
            </label>
            <CategorySelect id={dish.id} />
            <button
              className="deleteBtn"
              type="button"
              onClick={() => {
                onRemove(dish.id);
                redirect(history, location);
              }}
            >
              {translate("edit.delete")}
            </button>
            <button
              className="cancelBtn"
              type="button"
              onClick={() => redirect(history, location)}
            >
              {translate("edit.cancel")}
            </button>
            <button className="doneBtn" type="submit">
              {translate("edit.save")}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

EditDish.defaultProps = {
  dish: {
    name: "",
    description: "",
  },
};

EditDish.propTypes = {
  dish: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  translate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({
      backUrl: PropTypes.string,
    }),
  }).isRequired,
};

const handleSubmit = (event, id, history, location) => (dispatch) => {
  const data = new FormData(event.target);

  const edit = editDish({
    id,
    name: data.get("dishName"),
    description: data.get("dishDescription"),
    categoryIds: data.getAll("categoryIds"),
  });

  dispatch(edit);

  event.preventDefault();
  redirect(history, location);
};

const mapStateToProps = (state, { match }) => ({
  dish: {
    id: toInteger(match.params.id),
    name: get("name", state.dish),
    description: get("description", state.dish),
  },
  translate: getTranslate(state.locale),
});

const mapDispatchToProps = {
  onSubmit: handleSubmit,
  onRemove: removeDish,
  getDish: fetchDish,
  reset: resetDish,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDish);
