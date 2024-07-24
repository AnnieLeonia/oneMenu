import React, { Component } from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

function createMarkup(description) {
  if (!description) return;
  const html = micromark(description, {
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
    const { markdown, className } = this.props;

    return (
      <div
        ref={this.ref}
        dangerouslySetInnerHTML={createMarkup(markdown)}
        className={className}
      />
    );
  }
}

export default MarkdownRenderer;
