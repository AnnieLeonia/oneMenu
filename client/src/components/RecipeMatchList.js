import React from "react";
import PropTypes from "prop-types";
import onemenuicon from "../assets/icons/onemenu.svg";

const RecipeMatchList = ({ matches, translate, onSelect }) => {
  if (!matches.length) {
    return null;
  }

  return (
    <div className="recipe-match-list">
      <h3 className="recipe-match-heading">{translate("find.results")}</h3>
      <ul className="recipe-match-items">
        {matches.map(({ dish, matched, total, missing, missingNames }) => (
          <li key={dish.id}>
            <button
              type="button"
              className="recipe-match-item"
              onClick={() => onSelect(dish.id)}
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
                  {missing > 0 && (
                    <span className="recipe-match-missing">
                      {" "}
                      ·{" "}
                      {translate("find.missing", {
                        names: missingNames.slice(0, 4).join(", "),
                      })}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

RecipeMatchList.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      dish: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        img: PropTypes.string,
      }).isRequired,
      matched: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      missing: PropTypes.number.isRequired,
      missingNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  translate: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default RecipeMatchList;
