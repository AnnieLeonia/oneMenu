import React, { Component } from "react";
import { getMarkdown } from "./recipeMarkdown";
import markdownToHtml from "./markdownToHtml";
import { toggleCrossOut } from "./toggleCrossOut";

function createMarkup(description, ingredientMultiplier) {
  if (!description) return;
  const markdown = getMarkdown(description, { ingredientMultiplier });
  if (!markdown) return;
  return markdownToHtml(markdown);
}

class MarkdownRenderer extends Component {
  render() {
    const { markdown, className, ingredientMultiplier = 1 } = this.props;

    return (
      <div
        onClick={toggleCrossOut}
        dangerouslySetInnerHTML={createMarkup(markdown, ingredientMultiplier)}
        className={className}
      />
    );
  }
}

export default MarkdownRenderer;
