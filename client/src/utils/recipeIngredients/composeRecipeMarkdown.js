import {
  getRecipeTitle,
  getRecipeSummary,
  hasStructuredRecipeMeta,
} from "./parseRecipeFrontmatter";
import {
  getRecipeDifficulty,
  getRecipeTime,
  parseStepsFromFrontmatter,
} from "./parseRecipeFieldsFromFrontmatter";
import { parseIngredientsFromFrontmatter } from "./parseIngredientsFromFrontmatter";
import { stripStructuredBodyDuplicates } from "./parseRecipeBody";
import { formatMetaTable } from "./parseRecipeMeta";
import { extractStepsSectionRaw, formatStepsSection } from "./parseRecipeSteps";
import { extractIngredienserExtras } from "./parseIngredientsFromTable";
import { formatIngredientsSection } from "./formatIngredientsSection";

/**
 * Build markdown for rendering from YAML + freetext body.
 * @param {object} data
 * @param {string} content
 * @param {{ includeTitle?: boolean }} [options]
 * @returns {string}
 */
export function composeRecipeMarkdown(data, content, options = {}) {
  if (!hasStructuredRecipeMeta(data)) {
    return "";
  }

  const { includeTitle = true } = options;
  const title = getRecipeTitle(data);
  const summary = getRecipeSummary(data);
  const ingredients = parseIngredientsFromFrontmatter(data);
  const difficulty = getRecipeDifficulty(data);
  const time = getRecipeTime(data);
  let steps = parseStepsFromFrontmatter(data);
  if (!steps) {
    steps = extractStepsSectionRaw(content);
  }
  const metaTable = formatMetaTable({ difficulty, time });
  let ingredienserExtras =
    ingredients && content ? extractIngredienserExtras(content) : "";

  let body = stripStructuredBodyDuplicates(content, {
    title,
    description: summary,
    hasMeta: !!(difficulty || time),
    hasIngredients: !!ingredients,
    hasSteps: !!steps,
  });

  // Migrated bodies may only contain serving notes after strips (no ## Ingredienser left).
  if (
    ingredients &&
    !ingredienserExtras &&
    body &&
    !/^##\s+/m.test(body.trim())
  ) {
    ingredienserExtras = body.trim();
    body = "";
  }

  const parts = [];
  if (includeTitle && title) {
    parts.push(`# ${title}`);
  }
  if (metaTable) {
    parts.push(metaTable);
  }
  if (summary) {
    parts.push(summary);
  }
  if (body) {
    parts.push(body);
  }

  let markdown = parts.join("\n\n").trim();

  if (ingredients) {
    let section = formatIngredientsSection(ingredients).trim();
    if (ingredienserExtras) {
      section = `${section}\n\n${ingredienserExtras.trim()}`;
    }
    markdown = markdown ? `${markdown}\n\n${section}` : section;
  }

  if (steps) {
    const section = formatStepsSection(steps).trim();
    markdown = markdown ? `${markdown}\n\n${section}` : section;
  }

  return markdown;
}
