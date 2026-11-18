import {
  isEmpty,
  isNil,
  isObject,
  isString,
  sortBy,
  toString,
  uniq,
} from "lodash/fp";

import { parseFrontMatter } from "./parseFrontMatter";
import { scaleQuantity } from "./quantity";

const H1 = "# ";
const H3 = "### ";
const INGREDIENTS_HEADING = "🧂 Ingredienser";
const INGREDIENTS = `## ${INGREDIENTS_HEADING}`;

export const RECIPE_LABELS = {
  difficultyHeader: "💪 Nivå",
  timeHeader: "⏱️ Tid",
  servingsHeader: "🥘 Portioner",
  servingsUnit: "portioner",
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

const COOKING_HEADING = `## ${RECIPE_LABELS.cookingHeading}`;

function preambleMarkdown(data) {
  const title = toString(data.title);
  return [title && `${H1}${title}`, toString(data.description)]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

const META_TABLE = [
  `${RECIPE_LABELS.difficultyHeader}   | ${RECIPE_LABELS.timeHeader} | ${RECIPE_LABELS.servingsHeader}`,
  "---------------- | ------------- | --------",
];

export const SERVING_PRESETS = [2, 4, 6, 8, 12, 14];
const DEFAULT_SERVINGS = 4;
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

  const items = raw
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }
      if (typeof item !== "object" || !item.name) return null;
      const name = toString(item.name);
      if (!name) return null;

      let quantity;
      if (!isNil(item.quantity) && item.quantity !== "") {
        quantity =
          ingredientMultiplier === 1
            ? item.quantity
            : scaleQuantity(item.quantity, ingredientMultiplier);
      }

      return {
        name,
        quantity,
        unit: toString(item.unit) || undefined,
        group: toString(item.group) || undefined,
      };
    })
    .filter(Boolean);

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

const emptyShowInfo = () => ({
  baseServings: DEFAULT_SERVINGS,
  servingOptions: SERVING_PRESETS,
  showMetaTable: false,
  difficulty: "",
  time: "",
});

function recipeContext(description) {
  if (!isString(description) || isEmpty(description)) return null;
  const { data, content } = parseRecipe(description);
  const baseServings = parseRecipeServings(data);
  return {
    data,
    content,
    baseServings,
    servingOptions: sortBy((n) => n, uniq([...SERVING_PRESETS, baseServings])),
    showMetaTable: hasRecipeMeta(data),
    difficulty: toString(data.difficulty),
    time: toString(data.time),
  };
}

export function getRecipeContext(description) {
  return recipeContext(description);
}

export function getRecipeShowInfo(description) {
  const ctx = recipeContext(description);
  if (!ctx) return emptyShowInfo();
  const { baseServings, servingOptions, showMetaTable, difficulty, time } = ctx;
  return { baseServings, servingOptions, showMetaTable, difficulty, time };
}

function ingredientsMarkdown(
  items,
  ingredientsTable = INGREDIENTS_TABLE,
  { includeSectionHeading = true } = {}
) {
  if (!items?.length) return "";

  const lines = includeSectionHeading ? [INGREDIENTS] : [];
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
    let amount = EMPTY_AMOUNT;
    if (!isNil(quantity) && quantity !== "") {
      amount = unit ? `${quantity} ${unit}` : toString(quantity);
    } else if (unit) {
      amount = unit;
    }

    lines.push(`${amount} | ${name}`);
  }

  return lines.join("\n");
}

function stepsMarkdown(data, { includeSectionHeading = true } = {}) {
  const { steps } = data;
  if (steps == null) return "";

  if (typeof steps === "string") {
    const trimmed = steps.trim();
    if (!trimmed) return "";
    return includeSectionHeading
      ? [COOKING_HEADING, trimmed].join("\n")
      : trimmed;
  }

  if (!Array.isArray(steps) || !steps.length) return "";

  const lines = steps
    .map((step) => {
      if (step == null) return "";
      if (typeof step === "string") return step.trim();
      if (typeof step === "object" && step.text != null) {
        return toString(step.text).trim();
      }
      return "";
    })
    .filter(Boolean)
    .map((text, i) => `${i + 1}. ${text}`);

  if (!lines.length) return "";

  return includeSectionHeading
    ? [COOKING_HEADING, ...lines].join("\n")
    : lines.join("\n");
}

function recipeContentBlocks(
  data,
  content,
  ingredientMultiplier = 1,
  { includeSectionHeading = true } = {}
) {
  const ingredients = normalizeIngredients(
    data.ingredients,
    ingredientMultiplier
  );
  return {
    ingredientsMarkdown: ingredients
      ? ingredientsMarkdown(ingredients, INGREDIENTS_TABLE, {
          includeSectionHeading,
        })
      : "",
    cookingMarkdown: stepsMarkdown(data, { includeSectionHeading }),
    trailingMarkdown: (content || "").trim(),
  };
}

function metaTable(
  difficulty,
  time,
  servings = DEFAULT_SERVINGS,
  options = {}
) {
  const { includeServingsColumn = true } = options;
  const d = toString(difficulty);
  const timeStr = toString(time);
  const hasMeta = d || timeStr || includeServingsColumn;
  if (!hasMeta) return "";
  return [
    ...META_TABLE,
    `${d || "-"} | ${timeStr || "-"} | ${servings} ${
      RECIPE_LABELS.servingsUnit
    }`,
  ].join("\n");
}

function composeRecipeMarkdown(data, content, ingredientMultiplier = 1) {
  const title = toString(data.title);
  const servings = parseRecipeServings(data);
  const { ingredientsMarkdown, cookingMarkdown, trailingMarkdown } =
    recipeContentBlocks(data, content, ingredientMultiplier);

  return [
    title && `${H1}${title}`,
    metaTable(data.difficulty, data.time, servings, {
      includeServingsColumn: hasRecipeMeta(data),
    }),
    toString(data.description),
    ingredientsMarkdown,
    cookingMarkdown,
    trailingMarkdown,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

const emptyViewParts = () => ({
  preamble: "",
  ingredientsMarkdown: "",
  cooking: "",
  trailing: "",
});

function buildRecipeView(ctx, ingredientMultiplier = 1) {
  if (!ctx) {
    return { ...emptyShowInfo(), ...emptyViewParts() };
  }
  const { ingredientsMarkdown, cookingMarkdown, trailingMarkdown } =
    recipeContentBlocks(ctx.data, ctx.content, ingredientMultiplier, {
      includeSectionHeading: false,
    });
  return {
    baseServings: ctx.baseServings,
    servingOptions: ctx.servingOptions,
    showMetaTable: ctx.showMetaTable,
    difficulty: ctx.difficulty,
    time: ctx.time,
    preamble: preambleMarkdown(ctx.data),
    ingredientsMarkdown,
    cooking: cookingMarkdown,
    trailing: trailingMarkdown,
  };
}

export function getRecipeView(description, ingredientMultiplier = 1) {
  return buildRecipeView(recipeContext(description), ingredientMultiplier);
}

export function getRecipeViewForContext(ctx, ingredientMultiplier = 1) {
  return buildRecipeView(ctx, ingredientMultiplier);
}

export function getRecipeViewParts(description, ingredientMultiplier = 1) {
  const { preamble, ingredientsMarkdown, cooking, trailing } = getRecipeView(
    description,
    ingredientMultiplier
  );
  return { preamble, ingredientsMarkdown, cooking, trailing };
}

export function getMarkdown(description, { ingredientMultiplier = 1 } = {}) {
  const ctx = recipeContext(description);
  if (!ctx) return "";
  return (
    composeRecipeMarkdown(ctx.data, ctx.content, ingredientMultiplier) ||
    ctx.content ||
    ""
  );
}

export { scaleQuantity };
