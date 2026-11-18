import React, { Component } from "react";
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
