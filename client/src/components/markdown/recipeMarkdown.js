import {
  identity,
  isEmpty,
  isNil,
  isObject,
  isString,
  sortBy,
  toString,
  union,
} from "lodash/fp";

import { parseFrontMatter } from "./parseFrontMatter";

const H1 = "# ";
const H3 = "### ";
const INGREDIENTS_HEADING = "🧂 Ingredienser";
const INGREDIENTS = `## ${INGREDIENTS_HEADING}`;
const COOKING = "## 👩‍🍳 Tillagning";

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

export function splitRecipeBodyMarkdown(markdown) {
  if (!isString(markdown) || !markdown.trim()) {
    return { preamble: "", cooking: "" };
  }
  const lines = markdown.split("\n");
  const cookingIndex = lines.findIndex((line) => line.trim() === COOKING);
  if (cookingIndex === -1) {
    return { preamble: markdown.trim(), cooking: "" };
  }
  return {
    preamble: lines.slice(0, cookingIndex).join("\n").trim(),
    cooking: lines
      .slice(cookingIndex + 1)
      .join("\n")
      .trim(),
  };
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

function parseQuantity(quantity) {
  if (isNil(quantity) || quantity === "") return null;
  if (typeof quantity === "number" && !Number.isNaN(quantity)) return quantity;

  const s = toString(quantity).trim();
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);

  const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (fraction) {
    return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  }

  const mixed = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (mixed) {
    return (
      parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10)
    );
  }

  return null;
}

function formatQuantity(value) {
  if (!Number.isFinite(value)) return "";

  const tolerance = 0.02;
  const whole = Math.floor(value + tolerance);
  const fracPart = value - whole;
  const fracs = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
  ];

  if (Math.abs(fracPart) < tolerance) return String(whole);

  for (const [num, den] of fracs) {
    const f = num / den;
    if (Math.abs(fracPart - f) < tolerance) {
      return whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
    }
  }

  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

function scaleQuantity(quantity, multiplier) {
  if (multiplier === 1) return quantity;
  const parsed = parseQuantity(quantity);
  if (parsed == null) return quantity;
  return formatQuantity(parsed * multiplier);
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

export function getRecipeShowInfo(description) {
  const { data } = parseRecipe(description);
  const baseServings = parseRecipeServings(data);
  const difficulty = toString(data.difficulty);
  const time = toString(data.time);
  const servings = toString(data.servings);
  return {
    baseServings,
    servingOptions: sortBy(identity, union(SERVING_PRESETS, [baseServings])),
    showMetaTable: !!(difficulty || time || servings),
    difficulty,
    time,
  };
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

function stepsMarkdown(data) {
  const { steps } = data;
  if (steps == null) return "";

  if (typeof steps === "string") {
    const trimmed = steps.trim();
    if (!trimmed) return "";
    return [COOKING, trimmed].join("\n");
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

  return lines.length ? [COOKING, ...lines].join("\n") : "";
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

function composeRecipeMarkdown(
  data,
  content,
  ingredientMultiplier = 1,
  { excludeIngredients = false, excludeMeta = false } = {}
) {
  const title = toString(data.title);
  const ingredients = excludeIngredients
    ? null
    : normalizeIngredients(data.ingredients, ingredientMultiplier);
  const steps = stepsMarkdown(data);
  const servings = parseRecipeServings(data);
  const includeServingsColumn =
    data.servings != null ||
    !!toString(data.difficulty) ||
    !!toString(data.time);

  return [
    title && `${H1}${title}`,
    !excludeMeta &&
      metaTable(data.difficulty, data.time, servings, {
        includeServingsColumn,
      }),
    toString(data.description),
    !excludeIngredients && ingredients && ingredientsMarkdown(ingredients),
    steps,
    (content || "").trim(),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function getRecipeViewParts(description, ingredientMultiplier = 1) {
  const empty = { preamble: "", cooking: "", ingredientsMarkdown: "" };
  if (!isString(description) || isEmpty(description)) return empty;
  const { data, content } = parseRecipe(description);
  const ingredients = normalizeIngredients(
    data.ingredients,
    ingredientMultiplier
  );
  const bodyMarkdown = composeRecipeMarkdown(
    data,
    content,
    ingredientMultiplier,
    { excludeIngredients: true, excludeMeta: true }
  );
  return {
    ...splitRecipeBodyMarkdown(bodyMarkdown),
    ingredientsMarkdown: ingredients
      ? ingredientsMarkdown(ingredients, INGREDIENTS_TABLE, {
          includeSectionHeading: false,
        })
      : "",
  };
}

export function getMarkdown(description, options = {}) {
  if (!isString(description) || isEmpty(description)) return "";
  const {
    ingredientMultiplier = 1,
    excludeIngredients = false,
    excludeMeta = false,
  } = options;
  const { data, content } = parseRecipe(description);
  const composed = composeRecipeMarkdown(data, content, ingredientMultiplier, {
    excludeIngredients,
    excludeMeta,
  });
  return composed || content || "";
}

export { parseQuantity, scaleQuantity, formatQuantity };
