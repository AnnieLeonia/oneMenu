import React, { Component } from "react";
import { getMarkdown } from "./recipeMarkdown";
import markdownToHtml from "./markdownToHtml";
import { toggleCrossOut } from "./toggleCrossOut";

class MarkdownRenderer extends Component {
  render() {
    const { markdown, className } = this.props;
    const composed = markdown && getMarkdown(markdown);
    const html = composed && markdownToHtml(composed);

    return (
      <div
        onClick={toggleCrossOut}
        dangerouslySetInnerHTML={html}
        className={className}
      />
    );
  }
}

export default MarkdownRenderer;
