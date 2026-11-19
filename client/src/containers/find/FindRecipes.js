import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import onemenuicon from "../../assets/icons/onemenu.svg";
import IngredientSelector from "../../components/IngredientSelector";
import { buildCatalog, expandSelection } from "../../utils/ingredients/catalog";
import { matchDishes } from "../../utils/ingredients/match";

function FindRecipes({ dishes, translate, history }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const { catalog, getLabel, dishIndex } = buildCatalog(dishes);
  const matchIds = selectedIds.length
    ? expandSelection(selectedIds, catalog)
    : [];
  const matches = matchIds.length
    ? matchDishes(dishes, matchIds, dishIndex, getLabel, selectedIds)
    : [];

  const openDish = (id) =>
    history.push({ pathname: `/dishes/${id}`, query: { backUrl: "/find" } });

  return (
    <div className="find-page">
      <IngredientSelector
        catalog={catalog}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        translate={translate}
      />

      {selectedIds.length > 0 && matches.length === 0 && (
        <p className="find-empty">{translate("find.noMatches")}</p>
      )}

      {matches.length > 0 && (
        <div className="recipe-match-list">
          <h3 className="recipe-match-heading">{translate("find.results")}</h3>
          <ul className="recipe-match-items">
            {matches.map(({ dish, matched, total }) => (
              <li key={dish.id}>
                <button
                  type="button"
                  className="recipe-match-item"
                  onClick={() => openDish(dish.id)}
                >
                  <img
                    src={dish.img || onemenuicon}
                    alt=""
                    className="recipe-match-img"
                  />
                  <div className="recipe-match-info">
                    <div className="recipe-match-name">{dish.name}</div>
                    <div className="recipe-match-stats">
                      {translate("find.matchCount", {
                        matched: String(matched),
                        total: String(total),
                      })}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

FindRecipes.propTypes = {
  dishes: PropTypes.arrayOf(PropTypes.object).isRequired,
  translate: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};

export default connect((state) => ({
  dishes: state.dishes,
  translate: getTranslate(state.locale),
}))(FindRecipes);
