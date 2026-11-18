import { removeIngredientsSection } from "./parseIngredientsFromTable";
import { removeMetaTable } from "./parseRecipeMeta";
import { removeStepsSection } from "./parseRecipeSteps";

const H1_RE = /^#\s+(.+?)\s*$/m;

function removeH1Title(markdown) {
  return (markdown || "")
    .replace(H1_RE, "")
    .replace(/^\s*\n+/, "")
    .trimStart();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeSummaryParagraph(markdown, summary) {
  if (!summary) return markdown || "";
  let text = (markdown || "").trim();
  if (!text) return text;

  const full = summary.trim();
  const pattern = new RegExp(`(^|\\n\\n)${escapeRegExp(full)}(\\n\\n|$)`, "m");
  text = text.replace(pattern, "\n\n");

  const paragraphs = full
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length > 1) {
    for (const paragraph of paragraphs) {
      const lines = paragraph
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 1) {
        const singleLinePattern = new RegExp(
          `(^|\\n\\n)${lines
            .map((l) => escapeRegExp(l))
            .join("\\n")}(\\n\\n|$)`,
          "m"
        );
        text = text.replace(singleLinePattern, "\n\n");
      }
      for (const line of lines) {
        const linePattern = new RegExp(
          `(^|\\n\\n)${escapeRegExp(line)}(\\n\\n|$)`,
          "m"
        );
        text = text.replace(linePattern, "\n\n");
      }
    }
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Storage body: structured sections live only in YAML.
 * @param {string} content
 * @param {{
 *   title?: string,
 *   description?: string,
 *   hasIngredients?: boolean,
 *   hasMeta?: boolean,
 *   hasSteps?: boolean,
 * }} options
 * @returns {string}
 */
export function stripStructuredBodyDuplicates(content, options = {}) {
  let body = content || "";
  body = removeH1Title(body);
  if (options.description) {
    body = removeSummaryParagraph(body, options.description);
  }
  if (options.hasMeta) {
    body = removeMetaTable(body);
  }
  if (options.hasIngredients) {
    body = removeIngredientsSection(body);
  }
  if (options.hasSteps) {
    body = removeStepsSection(body);
  }
  return body.trim();
}
