import React, { Component } from "react";
import PropTypes from "prop-types";

import markdownToHtml from "./markdownToHtml";
import RecipeMetaTable from "./RecipeMetaTable";
import { toggleCrossOut } from "./toggleCrossOut";
import { getRecipeViewParts, RECIPE_LABELS } from "./recipeMarkdown";

function RecipeHtml({ markdown }) {
  const html = markdownToHtml(markdown);
  return html ? <div dangerouslySetInnerHTML={html} /> : null;
}

class RecipeMarkdownView extends Component {
  render() {
    const {
      markdown,
      className,
      ingredientMultiplier = 1,
      difficulty,
      time,
      baseServings,
      selectedServings,
      servingOptions,
      canScalePortions,
      onServingsChange,
    } = this.props;

    const { preamble, cooking, bodyMarkdown, ingredientsMarkdown } =
      getRecipeViewParts(markdown, ingredientMultiplier);
    const showFallbackBody = !cooking && bodyMarkdown;

    return (
      <div className={className}>
        <RecipeMetaTable
          difficulty={difficulty}
          time={time}
          baseServings={baseServings}
          selectedServings={selectedServings}
          servingOptions={servingOptions}
          canScalePortions={canScalePortions}
          onServingsChange={onServingsChange}
        />
        <div onClick={toggleCrossOut}>
          <RecipeHtml markdown={preamble} />
          {cooking && (
            <section className="recipe-cooking">
              <h2>{RECIPE_LABELS.cookingHeading}</h2>
              <RecipeHtml markdown={cooking} />
            </section>
          )}
          {showFallbackBody && <RecipeHtml markdown={bodyMarkdown} />}
          {ingredientsMarkdown && (
            <section className="recipe-ingredients">
              <h2>{RECIPE_LABELS.ingredientsHeading}</h2>
              <RecipeHtml markdown={ingredientsMarkdown} />
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
  difficulty: PropTypes.string,
  time: PropTypes.string,
  baseServings: PropTypes.number.isRequired,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  canScalePortions: PropTypes.bool.isRequired,
  onServingsChange: PropTypes.func.isRequired,
};

export default RecipeMarkdownView;
