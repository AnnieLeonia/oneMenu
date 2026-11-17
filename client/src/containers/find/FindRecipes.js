import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import IngredientSelector from "../../components/IngredientSelector";
import RecipeMatchList from "../../components/RecipeMatchList";
import {
  buildFindIngredientContext,
  buildDishIngredientIndex,
  matchDishes,
} from "../../utils/recipeIngredients";

class FindRecipes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: [],
    };
  }

  onSelectDish = (id) => {
    const { history } = this.props;
    history.push({
      pathname: `/dishes/${id}`,
      query: { backUrl: "/find" },
    });
  };

  render() {
    const { dishes, translate } = this.props;
    const { selectedIds } = this.state;
    const { catalog, getLabel } = buildFindIngredientContext(dishes);
    const index = buildDishIngredientIndex(dishes);
    const matches =
      selectedIds.length > 0
        ? matchDishes(dishes, selectedIds, index, getLabel)
        : [];

    return (
      <div className="find-page">
        <IngredientSelector
          ingredients={catalog}
          selectedIds={selectedIds}
          onChange={(ids) => this.setState({ selectedIds: ids })}
          translate={translate}
        />

        {selectedIds.length === 0 && (
          <p className="find-hint">{translate("find.hint")}</p>
        )}

        {selectedIds.length > 0 && matches.length === 0 && (
          <p className="find-empty">{translate("find.noMatches")}</p>
        )}

        <RecipeMatchList
          matches={matches}
          translate={translate}
          onSelect={this.onSelectDish}
        />
      </div>
    );
  }
}

FindRecipes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object).isRequired,
  translate: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  dishes: state.dishes,
  translate: getTranslate(state.locale),
});

export default connect(mapStateToProps)(FindRecipes);
