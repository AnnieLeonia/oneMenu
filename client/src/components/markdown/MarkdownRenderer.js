import React, { Component } from "react";
import { handleCrossOutClick } from "./crossOutClick";
import { getMarkdown } from "./recipeMarkdown";
import markdownToHtml from "./markdownToHtml";

function createMarkup(description, ingredientMultiplier) {
  if (!description) return;
  const markdown = getMarkdown(description, { ingredientMultiplier });
  if (!markdown) return;
  return markdownToHtml(markdown);
}

class MarkdownRenderer extends Component {
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

  handleClick = handleCrossOutClick;

  render() {
    const { markdown, className, ingredientMultiplier = 1 } = this.props;

    return (
      <div
        ref={this.ref}
        dangerouslySetInnerHTML={createMarkup(markdown, ingredientMultiplier)}
        className={className}
      />
    );
  }
}

export default MarkdownRenderer;
