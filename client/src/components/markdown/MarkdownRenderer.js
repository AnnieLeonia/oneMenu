import React from "react";
import { getMarkdown } from "./recipeMarkdown";
import markdownToHtml from "./markdownToHtml";
import { toggleCrossOut } from "./toggleCrossOut";

export default function MarkdownRenderer({ markdown, className }) {
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
