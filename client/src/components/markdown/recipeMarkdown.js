import {
  compact,
  isEmpty,
  isNil,
  isObject,
  isString,
  toString,
} from "lodash/fp";

import { parseFrontMatter } from "./parseFrontMatter";
import { scaleQuantity } from "./quantity";

const H1 = "# ";
const H3 = "### ";
const INGREDIENTS_HEADING = "🧂 Ingredienser";

export const RECIPE_LABELS = {
  difficultyHeader: "💪 Nivå",
  timeHeader: "⏱️ Tid",
  servingsHeader: "🥘 Portioner",
  servingsUnitShort: "st",
  ingredientsHeading: INGREDIENTS_HEADING,
  cookingHeading: "👩‍🍳 Tillagning",
  ingredientsTableAmount: "Mängd",
  ingredientsTableName: "🥕 Ingrediens",
};
const INGREDIENTS_TABLE = [
  `${RECIPE_LABELS.ingredientsTableAmount} | ${RECIPE_LABELS.ingredientsTableName}`,
  "----- | ----------",
];

function preambleMarkdown(data) {
  const title = toString(data.title);
  return [title && `${H1}${title}`, toString(data.description)]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export const SERVING_PRESETS = [2, 4, 6, 8, 12, 14];
export const DEFAULT_SERVINGS = 4;
const EMPTY_AMOUNT = "&nbsp;";

function parseRecipe(description) {
  if (!isString(description) || isEmpty(description)) {
    return { data: {}, content: "" };
  }
  try {
    const { data, content } = parseFrontMatter(description);
    return {
      data: isObject(data) ? data : {},
      content: content || "",
    };
  } catch {
    return { data: {}, content: description };
  }
}

function normalizeIngredients(raw, ingredientMultiplier = 1) {
  if (!Array.isArray(raw) || !raw.length) return null;

  const items = compact(
    raw.map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }
      if (typeof item !== "object" || !item.name) return null;
      const name = toString(item.name);
      if (!name) return null;

      const quantity =
        !isNil(item.quantity) && item.quantity !== ""
          ? scaleQuantity(item.quantity, ingredientMultiplier)
          : undefined;

      return {
        name,
        quantity,
        unit: toString(item.unit) || undefined,
        group: toString(item.group) || undefined,
      };
    })
  );

  return items.length ? items : null;
}

function parseRecipeServings(data) {
  const raw = data.servings;
  if (typeof raw === "number" && raw > 0) return raw;
  const parsed = parseInt(toString(raw), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SERVINGS;
}

const hasRecipeMeta = (data) =>
  !!(toString(data.difficulty) || toString(data.time) || data.servings != null);

const servingOptionsFor = (baseServings) =>
  [...new Set([...SERVING_PRESETS, baseServings])].sort((a, b) => a - b);

export function recipeContext(description) {
  if (!isString(description) || isEmpty(description)) return null;
  const { data, content } = parseRecipe(description);
  const baseServings = parseRecipeServings(data);
  return {
    data,
    content,
    baseServings,
    servingOptions: servingOptionsFor(baseServings),
    showMetaTable: hasRecipeMeta(data),
    difficulty: toString(data.difficulty),
    time: toString(data.time),
  };
}

function ingredientsMarkdown(items, ingredientsTable = INGREDIENTS_TABLE) {
  if (!items?.length) return "";

  const lines = [];
  const allGrouped = items.every((i) => toString(i.group));
  if (!allGrouped) lines.push(...ingredientsTable);

  let currentGroup = null;
  for (const item of items) {
    const group = item.group ? toString(item.group) : null;
    if (group && group !== currentGroup) {
      const isFirst = currentGroup == null;
      currentGroup = group;
      if (!isFirst || !allGrouped) lines.push("");
      lines.push(`${H3}${group}`, ...ingredientsTable);
    }

    const name = toString(item.name);
    if (!name) continue;

    const { quantity, unit } = item;
    const amount =
      isNil(quantity) || quantity === ""
        ? unit || EMPTY_AMOUNT
        : unit
        ? `${quantity} ${unit}`
        : toString(quantity);

    lines.push(`${amount} | ${name}`);
  }

  return lines.join("\n");
}

function stepsMarkdown(data) {
  const { steps } = data;
  if (steps == null) return "";

  if (typeof steps === "string") return steps.trim();

  if (!Array.isArray(steps) || !steps.length) return "";

  return compact(
    steps.map((step) => {
      if (step == null) return "";
      if (typeof step === "string") return step.trim();
      if (typeof step === "object" && step.text != null) {
        return toString(step.text).trim();
      }
      return "";
    })
  )
    .map((text, i) => `${i + 1}. ${text}`)
    .join("\n");
}

const EMPTY_RECIPE_VIEW = {
  baseServings: DEFAULT_SERVINGS,
  servingOptions: SERVING_PRESETS,
  showMetaTable: false,
  difficulty: "",
  time: "",
  preamble: "",
  ingredientsMarkdown: "",
  cooking: "",
  trailing: "",
};

export function buildRecipeView(ctx, ingredientMultiplier = 1) {
  if (!ctx) return { ...EMPTY_RECIPE_VIEW };

  const { data, content, ...meta } = ctx;
  const ingredients = normalizeIngredients(
    data.ingredients,
    ingredientMultiplier
  );

  return {
    ...meta,
    preamble: preambleMarkdown(data),
    ingredientsMarkdown: ingredients ? ingredientsMarkdown(ingredients) : "",
    cooking: stepsMarkdown(data),
    trailing: (content || "").trim(),
  };
}
