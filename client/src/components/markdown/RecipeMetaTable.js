import React from "react";
import PropTypes from "prop-types";

import { RECIPE_LABELS } from "./recipeMarkdown";

function RecipeMetaTable({
  difficulty,
  time,
  baseServings,
  selectedServings,
  servingOptions,
  canScalePortions,
  onServingsChange,
}) {
  const display = (value) => value || "-";
  const servingsLabel = `${baseServings} ${RECIPE_LABELS.servingsUnit}`;

  return (
    <table className="recipe-meta-table">
      <thead>
        <tr>
          <th>{RECIPE_LABELS.difficultyHeader}</th>
          <th>{RECIPE_LABELS.timeHeader}</th>
          <th>{RECIPE_LABELS.servingsHeader}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{display(difficulty)}</td>
          <td>{display(time)}</td>
          <td className="recipe-servings-cell">
            {canScalePortions ? (
              <select
                className="recipe-servings-select"
                value={String(selectedServings)}
                aria-label={RECIPE_LABELS.servingsHeader}
                onChange={(event) =>
                  onServingsChange(Number(event.target.value))
                }
              >
                {servingOptions.map((count) => (
                  <option key={count} value={String(count)}>
                    {count} {RECIPE_LABELS.servingsUnitShort}
                  </option>
                ))}
              </select>
            ) : (
              servingsLabel
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

RecipeMetaTable.propTypes = {
  difficulty: PropTypes.string,
  time: PropTypes.string,
  baseServings: PropTypes.number.isRequired,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  canScalePortions: PropTypes.bool.isRequired,
  onServingsChange: PropTypes.func.isRequired,
};

export default RecipeMetaTable;
