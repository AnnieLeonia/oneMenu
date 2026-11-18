import matter from "gray-matter";

const MD_TITLE_PREFIX = "# ";
const MD_GROUP_PREFIX = "### ";

const SECTION_INGREDIENTS = "## Ingredienser";
const SECTION_COOKING = "## Tillagning";

const INGREDIENT_TABLE = ["Mängd | Ingrediens", "----- | ----------"];
const META_TABLE_HEADER = [
  "Svårighetsgrad   | Tid",
  "---------------- | -------------",
];

const EMPTY_META_CELL = "—";
const EMPTY_AMOUNT_CELL = "&nbsp;";

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
  } catch {
    return { data: {}, content: description };
  }
}

function str(value) {
  return value == null ? "" : String(value).trim();
}

function hasStructuredRecipeMeta(data) {
  if (!data || typeof data !== "object") return false;
  return Boolean(
    str(data.title) ||
      str(data.description) ||
      str(data.summary) ||
      data.difficulty ||
      data.time ||
      (Array.isArray(data.ingredients) && data.ingredients.length > 0) ||
      (Array.isArray(data.steps) && data.steps.length > 0) ||
      (typeof data.steps === "string" && data.steps.trim())
  );
}

function parseIngredientItem(item) {
  if (!item) return null;
  if (typeof item === "string") {
    const name = item.trim();
    return name ? { name } : null;
  }
  if (typeof item !== "object" || !item.name) return null;

  const name = str(item.name);
  if (!name) return null;

  return {
    name,
    ...(item.quantity != null && item.quantity !== ""
      ? { quantity: item.quantity }
      : {}),
    ...(item.unit != null && str(item.unit) ? { unit: str(item.unit) } : {}),
    ...(item.group != null && str(item.group)
      ? { group: str(item.group) }
      : {}),
  };
}

function parseIngredientsFromFrontmatter(data) {
  if (!Array.isArray(data?.ingredients) || data.ingredients.length === 0) {
    return null;
  }
  const ingredients = data.ingredients.map(parseIngredientItem).filter(Boolean);
  return ingredients.length > 0 ? ingredients : null;
}

function parseStepItem(item) {
  if (item == null) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "object" && item.text != null) {
    return String(item.text).trim();
  }
  return "";
}

function parseStepsFromFrontmatter(data) {
  if (!data || data.steps == null) return null;

  if (typeof data.steps === "string") {
    const text = data.steps.trim();
    return text || null;
  }

  if (!Array.isArray(data.steps) || data.steps.length === 0) return null;

  const steps = data.steps.map(parseStepItem).filter(Boolean);
  return steps.length > 0 ? steps : null;
}

function formatAmountCell(item) {
  const quantity = item.quantity;
  const unit = item.unit ? str(item.unit) : "";

  if (quantity == null || quantity === "") {
    return unit || EMPTY_AMOUNT_CELL;
  }

  return unit ? `${quantity} ${unit}` : String(quantity);
}

/**
 * @param {Array<{ name: string, quantity?: *, unit?: string, group?: string }>} ingredients
 * @returns {string}
 */
function formatIngredientsSection(ingredients) {
  if (!ingredients?.length) return "";

  const allGrouped = ingredients.every((item) => str(item.group));
  const lines = [SECTION_INGREDIENTS];

  if (!allGrouped) {
    lines.push(...INGREDIENT_TABLE);
  }

  let currentGroup = null;
  for (const item of ingredients) {
    const group = item.group ? str(item.group) : null;
    if (group && group !== currentGroup) {
      const isFirstGroup = currentGroup == null;
      currentGroup = group;
      if (!isFirstGroup || !allGrouped) lines.push("");
      lines.push(`${MD_GROUP_PREFIX}${group}`, ...INGREDIENT_TABLE);
    }

    const name = str(item.name);
    if (!name) continue;
    lines.push(`${formatAmountCell(item)} | ${name}`);
  }

  return `${lines.join("\n")}\n`;
}

function formatMetaTable(difficulty, time) {
  const d = str(difficulty);
  const t = str(time);
  if (!d && !t) return "";

  return [
    ...META_TABLE_HEADER,
    `${d || EMPTY_META_CELL} | ${t || EMPTY_META_CELL}`,
  ].join("\n");
}

function formatStepsSection(steps) {
  if (steps == null) return "";
  if (typeof steps === "string") {
    const body = steps.trim();
    return body ? `${body}\n` : "";
  }
  if (!steps.length) return "";

  const lines = [SECTION_COOKING];
  steps.forEach((step, index) => {
    const text = str(step);
    if (text) lines.push(`${index + 1}. ${text}`);
  });
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}

/**
 * Build markdown for rendering: optional YAML fields, then body markdown unchanged.
 * @param {object} data
 * @param {string} content
 * @param {{ includeTitle?: boolean }} [options]
 * @returns {string}
 */
export function composeRecipeMarkdown(data, content, options = {}) {
  if (!hasStructuredRecipeMeta(data)) return "";

  const { includeTitle = true } = options;
  const title = str(data.title);
  const summary = str(data.description ?? data.summary);
  const ingredients = parseIngredientsFromFrontmatter(data);
  const steps = parseStepsFromFrontmatter(data);
  const metaTable = formatMetaTable(data.difficulty, data.time);
  const body = (content || "").trim();

  return [
    includeTitle && title && `${MD_TITLE_PREFIX}${title}`,
    metaTable,
    summary,
    ingredients && formatIngredientsSection(ingredients).trim(),
    steps && formatStepsSection(steps).trim(),
    body,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

/**
 * Markdown for display: compose structured frontmatter (when present), otherwise body only.
 * @param {string|null|undefined} description
 * @param {{ includeTitle?: boolean }} [options]
 * @returns {string}
 */
export function getMarkdownBody(description, options) {
  const { data, content } = parseDescription(description);
  const composed = composeRecipeMarkdown(data, content, options);
  return composed || content || "";
}
