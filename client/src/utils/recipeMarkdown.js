import matter from "gray-matter";
import { isEmpty, isNil, isObject, isString, toString } from "lodash/fp";

const H1 = "# ";
const H3 = "### ";
const INGREDIENTS = "## Ingredienser";
const COOKING = "## Tillagning";
const ING_TABLE = ["Mängd | Ingrediens", "----- | ----------"];
const META_TABLE = [
  "Svårighetsgrad   | Tid",
  "---------------- | -------------",
];
const EMPTY_AMOUNT = "&nbsp;";

export function parseDescription(description) {
  if (!isString(description) || isEmpty(description)) {
    return { data: {}, content: "" };
  }
  try {
    const { data, content } = matter(description);
    return {
      data: isObject(data) ? data : {},
      content: content || "",
    };
  } catch {
    return { data: {}, content: description };
  }
}

function normalizeIngredients(raw) {
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
      return {
        name,
        quantity:
          !isNil(item.quantity) && item.quantity !== ""
            ? item.quantity
            : undefined,
        unit: toString(item.unit) || undefined,
        group: toString(item.group) || undefined,
      };
    })
    .filter(Boolean);

  return items.length ? items : null;
}

function ingredientsMarkdown(items) {
  if (!items?.length) return "";

  const lines = [INGREDIENTS];
  const allGrouped = items.every((i) => toString(i.group));
  if (!allGrouped) lines.push(...ING_TABLE);

  let currentGroup = null;
  for (const item of items) {
    const group = item.group ? toString(item.group) : null;
    if (group && group !== currentGroup) {
      const isFirst = currentGroup == null;
      currentGroup = group;
      if (!isFirst || !allGrouped) lines.push("");
      lines.push(`${H3}${group}`, ...ING_TABLE);
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

function metaTable(difficulty, time) {
  const d = toString(difficulty);
  const timeStr = toString(time);
  if (!d && !timeStr) return "";
  return [...META_TABLE, `${d || "-"} | ${timeStr || "-"}`].join("\n");
}

function composeRecipeMarkdown(data, content) {
  const title = toString(data.title);
  const ingredients = normalizeIngredients(data.ingredients);
  const steps = stepsMarkdown(data);

  return [
    title && `${H1}${title}`,
    metaTable(data.difficulty, data.time),
    toString(data.description),
    ingredients && ingredientsMarkdown(ingredients),
    steps,
    (content || "").trim(),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function getMarkdownBody(description) {
  if (!isString(description) || isEmpty(description)) return "";
  const { data, content } = parseDescription(description);
  const composed = composeRecipeMarkdown(data, content);
  return composed || content || "";
}
