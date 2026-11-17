import matter from "gray-matter";
import { composeRecipeMarkdown } from "./composeRecipeMarkdown";

/**
 * Split optional YAML frontmatter from a dish description.
 * @param {string|null|undefined} description
 * @returns {{ data: object, content: string }}
 */
export function parseDescription(description) {
  if (!description || typeof description !== "string") {
    return { data: {}, content: "" };
  }

  try {
    const { data, content } = matter(description);
    return {
      data: data && typeof data === "object" ? data : {},
      content: content || "",
    };
  } catch (e) {
    return { data: {}, content: description };
  }
}

/**
 * Markdown for display (frontmatter composed into title, blurb, ingredienser).
 * @param {string|null|undefined} description
 * @param {{ includeTitle?: boolean }} [options]
 * @returns {string}
 */
export function getMarkdownBody(description, options) {
  const { data, content } = parseDescription(description);
  const composed = composeRecipeMarkdown(data, content, options);
  if (composed) {
    return composed;
  }
  return content || "";
}
