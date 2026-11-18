import React, { Component } from "react";
import PropTypes from "prop-types";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { getMarkdownBody } from "../utils/recipeMarkdown";

function createMarkup(markdown, stripFrontmatter) {
  if (!markdown) return;
  const body = getMarkdownBody(markdown, { stripFrontmatter });
  if (!body) return;
  const html = micromark(body, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });

  return { __html: html };
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
    const { markdown, className, stripFrontmatter } = this.props;

    return (
      <div
        ref={this.ref}
        dangerouslySetInnerHTML={createMarkup(markdown, stripFrontmatter)}
        className={className}
      />
    );
  }
}

MarkdownRenderer.propTypes = {
  markdown: PropTypes.string,
  className: PropTypes.string,
  stripFrontmatter: PropTypes.bool,
};

MarkdownRenderer.defaultProps = {
  markdown: "",
  className: "",
  stripFrontmatter: false,
};

export default MarkdownRenderer;
