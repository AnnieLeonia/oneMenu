import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { get, toInteger } from "lodash/fp";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

import { fetchDish } from "../../actions/dishes";
import onemenuicon from "../../assets/icons/onemenu.svg";

function createMarkup(description) {
  if (!description) return;
  const html = micromark(description, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });

  return { __html: html };
}

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

class ShowDish extends Component {
  componentDidMount() {
    this.props.getDish(this.props.id);
  }

  render() {
    const { id, name, img, description, translate, history, location } =
      this.props;

    return (
      <div className="dish">
        <div className="title">{name}</div>
        <div className="container">
          <img
            src={img || onemenuicon}
            alt="Dish image"
            className="responsive"
          ></img>
          <div
            dangerouslySetInnerHTML={createMarkup(description)}
            className="markdown-body"
          />
        </div>
        <br />
        <br />
        <br />
        <button
          className="cancelBtn"
          type="button"
          onClick={() => redirect(history, location)}
        >
          {translate("dishes.back")}
        </button>
        <button
          className="doneBtn"
          type="button"
          onClick={() =>
            history.push({
              pathname: `/dishes/edit/${id}`,
              query: { backUrl: `/dishes/${id}` },
            })
          }
        >
          {translate("edit.edit")}
        </button>
      </div>
    );
  }
}

ShowDish.defaultProps = {
  name: "",
  img: "",
};

ShowDish.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  img: PropTypes.string,
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

const mapStateToProps = (state, { match }) => ({
  id: toInteger(match.params.id),
  name: get("name", state.dish),
  img: get("img", state.dish),
  description: get("description", state.dish),
  translate: getTranslate(state.locale),
});

const mapDispatchToProps = {
  getDish: fetchDish,
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowDish);
