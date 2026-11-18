import React, { Component } from "react";
import PropTypes from "prop-types";

import markdownToHtml from "./markdownToHtml";
import RecipeMetaTable from "./RecipeMetaTable";
import { toggleCrossOut } from "./toggleCrossOut";
import {
  getIngredientsTableMarkdown,
  getMarkdown,
  getRecipeMeta,
  RECIPE_LABELS,
  splitRecipeBodyMarkdown,
} from "./recipeMarkdown";

class RecipeMarkdownView extends Component {
  render() {
    const {
      markdown,
      className,
      ingredientMultiplier = 1,
      baseServings,
      selectedServings,
      servingOptions,
      canScalePortions,
      onServingsChange,
    } = this.props;

    const meta = getRecipeMeta(markdown);
    const bodyMarkdown = getMarkdown(markdown, {
      ingredientMultiplier,
      excludeIngredients: true,
      excludeMeta: true,
    });
    const { preamble, cooking } = splitRecipeBodyMarkdown(bodyMarkdown);
    const ingredientsMarkdown = getIngredientsTableMarkdown(markdown, {
      ingredientMultiplier,
      ingredientsTableLabels: {
        amount: RECIPE_LABELS.ingredientsTableAmount,
        name: RECIPE_LABELS.ingredientsTableName,
      },
    });
    const preambleHtml = markdownToHtml(preamble);
    const cookingHtml = markdownToHtml(cooking);
    const fallbackBodyHtml =
      !cooking && bodyMarkdown ? markdownToHtml(bodyMarkdown) : null;
    const ingredientsHtml = markdownToHtml(ingredientsMarkdown);

    return (
      <div className={className}>
        <RecipeMetaTable
          difficulty={meta.difficulty}
          time={meta.time}
          baseServings={baseServings}
          selectedServings={selectedServings}
          servingOptions={servingOptions}
          canScalePortions={canScalePortions}
          onServingsChange={onServingsChange}
        />
        <div onClick={toggleCrossOut}>
          {preambleHtml && <div dangerouslySetInnerHTML={preambleHtml} />}
          {cookingHtml && (
            <section className="recipe-cooking">
              <h2>{RECIPE_LABELS.cookingHeading}</h2>
              <div dangerouslySetInnerHTML={cookingHtml} />
            </section>
          )}
          {fallbackBodyHtml && (
            <div dangerouslySetInnerHTML={fallbackBodyHtml} />
          )}
          {ingredientsHtml && (
            <section className="recipe-ingredients">
              <h2>{RECIPE_LABELS.ingredientsHeading}</h2>
              <div dangerouslySetInnerHTML={ingredientsHtml} />
            </section>
          )}
        </div>
      </div>
    );
  }
}

RecipeMarkdownView.propTypes = {
  markdown: PropTypes.string.isRequired,
  className: PropTypes.string,
  ingredientMultiplier: PropTypes.number,
  baseServings: PropTypes.number.isRequired,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  canScalePortions: PropTypes.bool.isRequired,
  onServingsChange: PropTypes.func.isRequired,
};

export default RecipeMarkdownView;
