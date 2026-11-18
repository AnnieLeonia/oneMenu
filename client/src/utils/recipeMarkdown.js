import matter from "gray-matter";
import { isEmpty, isString } from "lodash/fp";

export function parseDescription(description) {
  if (!isString(description) || isEmpty(description)) {
    return { data: {}, content: "" };
  }
  try {
    const { data, content } = matter(description);
    return {
      data: data && typeof data === "object" ? data : {},
      content: content || "",
    };
  } catch {
    return { data: {}, content: description };
  }
}

/** Markdown body for preview/render (optional YAML frontmatter strip). */
export function getMarkdownBody(
  description,
  { stripFrontmatter = false } = {}
) {
  if (!isString(description) || isEmpty(description)) return "";

  if (!stripFrontmatter) {
    return description.trim();
  }

  const { content } = parseDescription(description);
  const body = (content || description).trim();
  return body;
}
