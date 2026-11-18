import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { get, toInteger } from "lodash/fp";

import { fetchDish, resetDish } from "../../actions/dishes";
import onemenuicon from "../../assets/icons/onemenu.svg";
import MarkdownRenderer from "../../components/markdown/MarkdownRenderer";
import RecipeMarkdownView from "../../components/markdown/RecipeMarkdownView";
import {
  getRecipeBaseServings,
  getServingOptions,
  recipeHasIngredientQuantities,
  recipeHasRecipeMeta,
} from "../../components/markdown/recipeMarkdown";

const redirect = (history, location) =>
  history.push((location.query || {}).backUrl || "/");

class ShowDish extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedServings: getRecipeBaseServings("") };
  }

  componentDidMount() {
    this.props.getDish(this.props.id, this.props.history);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.setState({
        selectedServings: getRecipeBaseServings(this.props.description),
      });
    } else if (!prevProps.description && this.props.description) {
      this.setState({
        selectedServings: getRecipeBaseServings(this.props.description),
      });
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const {
      id,
      name,
      img,
      description,
      translate,
      history,
      location,
      isLoggedIn,
    } = this.props;
    const { selectedServings } = this.state;
    const canScalePortions = recipeHasIngredientQuantities(description);
    const showRecipeView = canScalePortions || recipeHasRecipeMeta(description);
    const baseServings = getRecipeBaseServings(description);
    const servingOptions = getServingOptions(baseServings);
    const ingredientMultiplier = selectedServings / baseServings;

    if (!name) {
      return null;
    }

    return (
      <div className="dish">
        <div className="title">{name}</div>
        <div className="container">
          <img src={img || onemenuicon} alt="Dish" className="responsive"></img>
          {showRecipeView ? (
            <RecipeMarkdownView
              markdown={description}
              className="markdown-body"
              ingredientMultiplier={ingredientMultiplier}
              baseServings={baseServings}
              selectedServings={selectedServings}
              servingOptions={servingOptions}
              canScalePortions={canScalePortions}
              onServingsChange={(count) =>
                this.setState({ selectedServings: count })
              }
            />
          ) : (
            <MarkdownRenderer
              markdown={description}
              className="markdown-body"
            />
          )}
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
        {isLoggedIn && (
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
        )}
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
  description: PropTypes.string,
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
  isLoggedIn: !!state.user.email,
});

const mapDispatchToProps = {
  getDish: fetchDish,
  reset: resetDish,
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowDish);
