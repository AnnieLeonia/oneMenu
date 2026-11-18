import React from "react";
import PropTypes from "prop-types";

function RecipeMetaTable({
  difficulty,
  time,
  selectedServings,
  servingOptions,
  onServingsChange,
  translate,
}) {
  const display = (value) => value || "-";

  return (
    <table className="recipe-meta-table">
      <thead>
        <tr>
          <th>{translate("dishes.difficultyHeader")}</th>
          <th>{translate("dishes.timeHeader")}</th>
          <th>{translate("dishes.servingsHeader")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{display(difficulty)}</td>
          <td>{display(time)}</td>
          <td className="recipe-servings-cell">
            <span className="recipe-servings-label">
              {selectedServings} {translate("dishes.servingsUnit")}
            </span>
            <select
              className="recipe-servings-select"
              value={String(selectedServings)}
              aria-label={translate("dishes.servingsHeader")}
              onChange={(event) => onServingsChange(Number(event.target.value))}
            >
              {servingOptions.map((count) => (
                <option key={count} value={String(count)}>
                  {count} {translate("dishes.servingsUnit")}
                </option>
              ))}
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

RecipeMetaTable.propTypes = {
  difficulty: PropTypes.string,
  time: PropTypes.string,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onServingsChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

export default RecipeMetaTable;
