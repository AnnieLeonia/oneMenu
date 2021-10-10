import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { find, get, toInteger, toNumber } from "lodash/fp";

import { editDish, removeDish } from "../../actions/dishes";
import CategorySelect from "./CategorySelect";

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

const EditDish = ({
  id,
  name,
  unit,
  translate,
  onRemove,
  onSubmit,
  history,
  location,
}) => (
  <div className="dish">
    <div className="title">
      <b>{translate("edit.edit")}: </b>
      {name}
    </div>
    <div className="wrapper">
      <form onSubmit={(evt) => onSubmit(evt, id, history, location)}>
        <label htmlFor="dishName">
          <span>{translate("edit.name")}:</span>
          <input
            id="dishName"
            name="dishName"
            autoComplete="off"
            defaultValue={name}
          />
        </label>
        <CategorySelect id={id} />
        <button
          className="deleteBtn"
          type="button"
          onClick={() => {
            onRemove(id);
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

EditDish.defaultProps = {
  name: "",
};

EditDish.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
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
    categoryIds: data.getAll("categoryIds"),
  });

  dispatch(edit);

  event.preventDefault();
  redirect(history, location);
};

const mapStateToProps = (state, { match }) => {
  const id = toInteger(match.params.id);
  const dish = find({ id }, state.dishes);

  return {
    id,
    name: get("name", dish),
    amount: toNumber(get("amount", dish)) || null,
    unit: get("unit", dish),
    translate: getTranslate(state.locale),
  };
};

const mapDispatchToProps = {
  onSubmit: handleSubmit,
  onRemove: removeDish,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDish);
