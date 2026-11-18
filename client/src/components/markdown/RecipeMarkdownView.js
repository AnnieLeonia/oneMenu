import React from "react";
import PropTypes from "prop-types";

import markdownToHtml from "./markdownToHtml";
import { toggleCrossOut } from "./toggleCrossOut";
import { getRecipeViewParts, RECIPE_LABELS } from "./recipeMarkdown";

const recipeHtml = (markdown) => {
  const html = markdownToHtml(markdown);
  return html ? <div dangerouslySetInnerHTML={html} /> : null;
};

function RecipeMarkdownView({
  markdown,
  className,
  ingredientMultiplier = 1,
  difficulty,
  time,
  selectedServings,
  servingOptions,
  showMetaTable,
  onServingsChange,
}) {
  const { preamble, cooking, ingredientsMarkdown } = getRecipeViewParts(
    markdown,
    ingredientMultiplier
  );

  return (
    <div className={className}>
      {showMetaTable && (
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
              <td>{difficulty || "-"}</td>
              <td>{time || "-"}</td>
              <td className="recipe-servings-cell">
                <select
                  className="recipe-servings-select"
                  value={String(selectedServings)}
                  aria-label={RECIPE_LABELS.servingsHeader}
                  onChange={(e) => onServingsChange(Number(e.target.value))}
                >
                  {servingOptions.map((count) => (
                    <option key={count} value={String(count)}>
                      {count} {RECIPE_LABELS.servingsUnitShort}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div onClick={toggleCrossOut}>
        {recipeHtml(preamble)}
        {cooking && (
          <section className="recipe-cooking">
            <h2>{RECIPE_LABELS.cookingHeading}</h2>
            {recipeHtml(cooking)}
          </section>
        )}
        {ingredientsMarkdown && (
          <section className="recipe-ingredients">
            <h2>{RECIPE_LABELS.ingredientsHeading}</h2>
            {recipeHtml(ingredientsMarkdown)}
          </section>
        )}
      </div>
    </div>
  );
}

RecipeMarkdownView.propTypes = {
  markdown: PropTypes.string.isRequired,
  className: PropTypes.string,
  ingredientMultiplier: PropTypes.number,
  difficulty: PropTypes.string,
  time: PropTypes.string,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  showMetaTable: PropTypes.bool.isRequired,
  onServingsChange: PropTypes.func,
};

RecipeMarkdownView.defaultProps = {
  onServingsChange: () => {},
};

export default RecipeMarkdownView;
