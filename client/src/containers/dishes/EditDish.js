import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { get, toInteger } from "lodash/fp";

import {
  editDish,
  fetchDish,
  removeDish,
  resetDish,
} from "../../actions/dishes";
import { createMarkup } from "../../utils";
import CategorySelect from "./CategorySelect";

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

class EditDish extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      description: "",
      img: "",
      category: "",
    };
  }

  componentDidMount() {
    const { dish, history } = this.props;
    this.props.getDish(dish.id, history).then((res) => this.setState(res.dish));
  }

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const { dish, translate, history, location } = this.props;
    const { onRemove, onSubmit } = this.props;

    return (
      <div className="dish flex flex-col">
        <div className="title">
          <b>{translate("edit.edit")}: </b>
          {this.state.name}
        </div>
        <div className="flex flex-row wrapper">
          <form
            className="flex flex-col"
            onSubmit={(evt) => onSubmit(evt, dish.id, history, location)}
          >
            <label htmlFor="dishName">
              <span>{translate("edit.name")}:</span>
              <input
                id="dishName"
                name="dishName"
                autoComplete="off"
                value={this.state.name || ""}
                onChange={(evt) => this.setState({ name: evt.target.value })}
              />
            </label>
            <label htmlFor="dishImg">
              <span>{translate("edit.img")}:</span>
              <input
                id="dishImg"
                name="dishImg"
                autoComplete="off"
                value={this.state.img || ""}
                onChange={(evt) => this.setState({ img: evt.target.value })}
              />
            </label>
            <label className="flex flex-row" htmlFor="dishDescription">
              <span>{translate("edit.description")}:</span>
              <textarea
                id="dishDescription"
                name="dishDescription"
                autoComplete="off"
                value={this.state.description || ""}
                onChange={(evt) =>
                  this.setState({ description: evt.target.value })
                }
              />
            </label>
            <CategorySelect id={dish.id} />
            <br />
            <br />
            <br />
            <button
              className="deleteBtn"
              type="button"
              onClick={async () => {
                onRemove(dish.id);
                history.push("/");
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
          <div
            dangerouslySetInnerHTML={createMarkup(this.state.description)}
            className="flex flex-col markdown-body markdown-preview"
          />
        </div>
      </div>
    );
  }
}

EditDish.defaultProps = {
  dish: {
    name: "",
    img: "",
    description: "",
  },
};

EditDish.propTypes = {
  dish: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    img: PropTypes.string,
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
    img: data.get("dishImg"),
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
    img: get("img", state.dish),
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
