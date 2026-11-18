import React, { Component } from "react";
import PropTypes from "prop-types";

import markdownToHtml from "./markdownToHtml";
import RecipeMetaTable from "./RecipeMetaTable";
import {
  getIngredientsTableMarkdown,
  getMarkdown,
  getRecipeMeta,
  INGREDIENTS_HEADING,
} from "./recipeMarkdown";

class RecipeMarkdownView extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.ref.current.addEventListener("click", this.handleClick);
  }

  componentWillUnmount() {
    this.ref.current.removeEventListener("click", this.handleClick);
  }

  handleClick = (event) => {
    const crossableTags = ["li", "tr"];
    let target = event.target;

    while (target && target.tagName) {
      const tagName = target.tagName.toLowerCase();
      if (crossableTags.includes(tagName)) {
        target.classList.toggle("crossed-out");
        break;
      }
      target = target.parentElement;
    }
  };

  render() {
    const {
      markdown,
      className,
      ingredientMultiplier = 1,
      selectedServings,
      servingOptions,
      onServingsChange,
      translate,
    } = this.props;

    const meta = getRecipeMeta(markdown);
    const bodyMarkdown = getMarkdown(markdown, {
      ingredientMultiplier,
      excludeIngredients: true,
      excludeMeta: true,
    });
    const ingredientsMarkdown = getIngredientsTableMarkdown(markdown, {
      ingredientMultiplier,
    });
    const bodyHtml = markdownToHtml(bodyMarkdown);
    const ingredientsHtml = markdownToHtml(ingredientsMarkdown);

    return (
      <div ref={this.ref} className={className}>
        <RecipeMetaTable
          difficulty={meta.difficulty}
          time={meta.time}
          selectedServings={selectedServings}
          servingOptions={servingOptions}
          onServingsChange={onServingsChange}
          translate={translate}
        />
        {bodyHtml && <div dangerouslySetInnerHTML={bodyHtml} />}
        {ingredientsHtml && (
          <section className="recipe-ingredients">
            <h2>{INGREDIENTS_HEADING}</h2>
            <div dangerouslySetInnerHTML={ingredientsHtml} />
          </section>
        )}
      </div>
    );
  }
}

RecipeMarkdownView.propTypes = {
  markdown: PropTypes.string.isRequired,
  className: PropTypes.string,
  ingredientMultiplier: PropTypes.number,
  selectedServings: PropTypes.number.isRequired,
  servingOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onServingsChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

export default RecipeMarkdownView;
