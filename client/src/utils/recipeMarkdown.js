import matter from "gray-matter";

const TILLAGNING_HEADING =
  /^(Tillagning|Instructions|Method|Directions|Tillberedning|Gör så här|Instruktioner)\b/i;
const INGREDIENSER_HEADING = /^(Ingredienser|Ingredients)\b/i;

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

function str(value) {
  return value == null ? "" : String(value).trim();
}

function hasStructuredRecipeMeta(data) {
  if (!data || typeof data !== "object") return false;
  if (str(data.title) || str(data.description) || str(data.summary))
    return true;
  if (data.difficulty || data.time) return true;
  if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
    return true;
  if (Array.isArray(data.steps) && data.steps.length > 0) return true;
  if (typeof data.steps === "string" && data.steps.trim()) return true;
  return false;
}

function parseIngredientsFromFrontmatter(data) {
  if (
    !data ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0
  ) {
    return null;
  }

  const ingredients = data.ingredients
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }
      if (typeof item === "object" && item.name) {
        const name = String(item.name).trim();
        if (!name) return null;
        const result = { name };
        if (item.quantity != null && item.quantity !== "") {
          result.quantity = item.quantity;
        }
        if (item.unit != null && str(item.unit)) {
          result.unit = str(item.unit);
        }
        if (item.group != null && str(item.group)) {
          result.group = str(item.group);
        }
        return result;
      }
      return null;
    })
    .filter(Boolean);

  return ingredients.length > 0 ? ingredients : null;
}

function parseStepsFromFrontmatter(data) {
  if (!data || data.steps == null) return null;

  if (typeof data.steps === "string") {
    const text = data.steps.trim();
    return text || null;
  }

  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    return null;
  }

  const steps = data.steps
    .map((item) => {
      if (item == null) return "";
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item.text != null) {
        return String(item.text).trim();
      }
      return "";
    })
    .filter(Boolean);

  return steps.length > 0 ? steps : null;
}

function formatAmountCell(item) {
  const quantity = item.quantity;
  const unit = item.unit ? str(item.unit) : "";

  if (quantity == null || quantity === "") {
    return unit || "&nbsp;";
  }

  const qtyText =
    typeof quantity === "number" && quantity === 0.5 ? "1/2" : String(quantity);

  return unit ? `${qtyText} ${unit}` : qtyText;
}

/**
 * @param {Array<{ name: string, quantity?: *, unit?: string, group?: string }>} ingredients
 * @returns {string}
 */
function formatIngredientsSection(ingredients) {
  if (!ingredients || ingredients.length === 0) {
    return "";
  }

  const allGrouped = ingredients.every((item) => item.group && str(item.group));

  const lines = ["## Ingredienser"];
  if (!allGrouped) {
    lines.push("Mängd | Ingrediens", "----- | ----------");
  }

  let currentGroup = null;
  ingredients.forEach((item) => {
    const group = item.group ? str(item.group) : null;
    if (group && group !== currentGroup) {
      const isFirstGroup = currentGroup == null;
      currentGroup = group;
      if (!isFirstGroup || !allGrouped) {
        lines.push("");
      }
      lines.push(`### ${group}`);
      lines.push("Mängd | Ingrediens", "----- | ----------");
    }

    const amount = formatAmountCell(item);
    const name = str(item.name);
    if (!name) return;
    lines.push(`${amount} | ${name}`);
  });

  return `${lines.join("\n")}\n`;
}

function formatMetaTable(difficulty, time) {
  const d = str(difficulty);
  const t = str(time);
  if (!d && !t) return "";

  return [
    "Svårighetsgrad   | Tid",
    "---------------- | -------------",
    `${d || "—"} | ${t || "—"}`,
  ].join("\n");
}

function formatStepsSection(steps) {
  const heading = "## Tillagning";
  if (steps == null) return "";
  if (typeof steps === "string") {
    const body = steps.trim();
    if (!body) return "";
    if (
      /^##\s+(Tillagning|Instructions|Method|Directions|Tillberedning)\b/im.test(
        body
      )
    ) {
      return `${body}\n`;
    }
    return `${heading}\n\n${body}\n`;
  }
  if (!Array.isArray(steps) || steps.length === 0) return "";

  const lines = [heading];
  steps.forEach((step, index) => {
    const text = str(step);
    if (text) lines.push(`${index + 1}. ${text}`);
  });
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}

function removeLeadingH1(markdown, title) {
  let body = (markdown || "").replace(/^#\s+.+$/m, "").trimStart();
  if (!title) return body;

  const summary = str(title);
  if (!summary) return body;

  const escaped = summary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  body = body.replace(
    new RegExp(`(^|\\n\\n)${escaped}(\\n\\n|$)`, "m"),
    "\n\n"
  );
  return body.replace(/\n{3,}/g, "\n\n").trim();
}

function removeH2Section(markdown, titlePattern) {
  const lines = (markdown || "").split(/\r?\n/);
  const out = [];
  let skipping = false;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      const title = h2[1].trim();
      if (titlePattern.test(title)) {
        skipping = true;
        continue;
      }
      skipping = false;
    }
    if (!skipping) {
      out.push(lines[i]);
    }
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeLegacyMetaTable(markdown) {
  const lines = (markdown || "").split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const row = lines[i];
    const lower = row.toLowerCase();
    const isMetaHeader =
      row.includes("|") &&
      /svårighetsgrad|difficulty/.test(lower) &&
      /\btid\b|time|duration/.test(lower);

    if (isMetaHeader) {
      i += 1;
      if (i < lines.length && /^[\s|:-]+$/.test(lines[i].trim())) i += 1;
      if (i < lines.length && lines[i].includes("|")) i += 1;
      while (i < lines.length && !lines[i].trim()) i += 1;
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function displayBody(
  content,
  { title, summary, hasMeta, hasIngredients, hasSteps }
) {
  let body = removeLeadingH1(content, title);
  if (summary) {
    const escaped = summary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(
      new RegExp(`(^|\\n\\n)${escaped}(\\n\\n|$)`, "m"),
      "\n\n"
    );
    body = body.replace(/\n{3,}/g, "\n\n").trim();
  }
  if (hasMeta) {
    body = removeLegacyMetaTable(body);
  }
  if (hasIngredients) {
    body = removeH2Section(body, INGREDIENSER_HEADING);
  }
  if (hasSteps) {
    body = removeH2Section(body, TILLAGNING_HEADING);
  }
  return body.trim();
}

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
  const title = str(data.title);
  const summary = str(
    data.description != null ? data.description : data.summary
  );
  const ingredients = parseIngredientsFromFrontmatter(data);
  const steps = parseStepsFromFrontmatter(data);
  const metaTable = formatMetaTable(data.difficulty, data.time);

  const body = displayBody(content, {
    title,
    summary,
    hasMeta: !!(str(data.difficulty) || str(data.time)),
    hasIngredients: !!ingredients,
    hasSteps: !!steps,
  });

  const parts = [];
  if (includeTitle && title) parts.push(`# ${title}`);
  if (metaTable) parts.push(metaTable);
  if (summary) parts.push(summary);
  if (body) parts.push(body);
  if (ingredients) parts.push(formatIngredientsSection(ingredients).trim());
  if (steps) parts.push(formatStepsSection(steps).trim());

  return parts.filter(Boolean).join("\n\n").trim();
}

/**
 * Markdown for display (frontmatter composed into title, blurb, ingredienser, tillagning).
 * @param {string|null|undefined} description
 * @param {{ includeTitle?: boolean }} [options]
 * @returns {string}
 */
export function getMarkdownBody(description, options) {
  const { data, content } = parseDescription(description);
  const composed = composeRecipeMarkdown(data, content, options);
  return composed || content || "";
}
