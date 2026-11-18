import { parseTableAmount } from "./parseTableAmount";

const BULLET_LINE = /^[-*+]\s+(.+)$/;
const SUBSECTION_HEADING = /^###\s+(.+)$/;
const BOLD_SUBSECTION = /^\*\*(.+?):\*\*\s*$/;
const SERVING_PLAIN_HEADING =
  /^(till\s+servering|vid\s+servering|servering|till\s+garnering)\s*$/i;
const SERVING_PIPE_HEADING =
  /^(till\s+servering|vid\s+servering|servering|till\s+garnering)\s*\|\s*$/i;

function normalizeServingGroupLabel(raw) {
  const t = String(raw || "").trim();
  if (/till\s+garnering/i.test(t)) {
    return "Till garnering";
  }
  if (/servering/i.test(t)) {
    return "Till servering";
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const SEPARATOR_RE = /^[\s|:-]+$/;
const HEADER_NAMES = /^(mängd|ingrediens|amount|ingredient|qty|quantity)$/i;
const AMOUNT_HEADER = /^(mängd|amount|qty|quantity)$/i;
const INGREDIENT_HEADER = /^(ingrediens|ingredient|ingredienser|ingredients)$/i;
const INGREDIENSER_H2 = /^(ingredienser|ingredients)\b/i;
const TILLAGNING_H2 =
  /^(tillagning|instructions|method|directions|tillberedning|gör så här|instruktioner)\b/i;

function splitTableRow(line) {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function isSeparatorLine(line) {
  return SEPARATOR_RE.test((line || "").trim());
}

export function isIngredientTableHeader(line) {
  if (!line || !line.includes("|")) return false;
  const cells = splitTableRow(line).map((c) => c.toLowerCase());
  if (cells.length < 2) return false;
  return (
    cells.some((c) => INGREDIENT_HEADER.test(c)) &&
    cells.some((c) => AMOUNT_HEADER.test(c))
  );
}

function isTillagningHeading(title) {
  return TILLAGNING_H2.test((title || "").trim());
}

function normalizeSectionTitle(title) {
  return (title || "").trim().replace(/^[^A-Za-zÅÄÖåäö]+/u, "");
}

function isIngredienserHeading(title) {
  return INGREDIENSER_H2.test(normalizeSectionTitle(title));
}

function pushTableRow(cells, ingredients, group) {
  if (cells.length < 1) return;
  if (SEPARATOR_RE.test(cells.join(""))) return;

  if (cells.length === 1) {
    if (!group) return;
    const name = cells[0]
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!name || HEADER_NAMES.test(name)) return;
    ingredients.push({ name, group });
    return;
  }

  const nameCell = cells[cells.length - 1];
  if (HEADER_NAMES.test(nameCell)) return;
  if (HEADER_NAMES.test(cells[0]) && cells.length === 2) return;

  const name = nameCell
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name === "-" || name === "—") return;

  const amountCell = cells.length >= 2 ? cells[0] : "";
  const amount = parseTableAmount(amountCell);
  const item = { name, ...amount };
  if (group) {
    item.group = group;
  }
  ingredients.push(item);
}

function pushLoneLine(line, ingredients, group) {
  if (!group) return;

  const name = line
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name === "-" || name === "—") return;
  if (HEADER_NAMES.test(name)) return;

  ingredients.push({ name, group });
}

function consumeIngredientTable(lines, headerIndex, ingredients, group) {
  let i = headerIndex + 1;
  if (i < lines.length && isSeparatorLine(lines[i])) {
    i += 1;
  }
  while (i < lines.length) {
    const row = lines[i].trim();
    if (!row || !row.includes("|") || isIngredientTableHeader(row)) {
      break;
    }
    pushTableRow(splitTableRow(lines[i]), ingredients, group);
    i += 1;
  }
  return i - 1;
}

/**
 * Scan the recipe for Mängd/Ingrediens-style tables (including per-rätt ## sections).
 * Stops at ## Tillagning.
 *
 * @param {string} markdownBody
 * @returns {Array<{ name: string, quantity?: string|number, unit?: string, group?: string }>|null}
 */
export function parseIngredientsFromTable(markdownBody) {
  if (!markdownBody || typeof markdownBody !== "string") {
    return null;
  }

  const lines = markdownBody.split(/\r?\n/);
  const mainIngredients = [];
  const componentIngredients = [];
  let componentGroup = null;
  let subsectionGroup = null;
  let inIngredienserSection = false;
  let stopped = false;

  function activeIngredients() {
    return inIngredienserSection ? mainIngredients : componentIngredients;
  }

  for (let i = 0; i < lines.length && !stopped; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      continue;
    }

    const h2Match = /^##\s+(.+)$/.exec(trimmed);
    if (h2Match) {
      const h2Title = h2Match[1].trim();
      if (isTillagningHeading(h2Title)) {
        stopped = true;
        break;
      }
      if (isIngredienserHeading(h2Title)) {
        inIngredienserSection = true;
        componentGroup = null;
        subsectionGroup = null;
        continue;
      }
      inIngredienserSection = false;
      componentGroup = h2Title;
      subsectionGroup = null;
      continue;
    }

    const subsectionMatch = SUBSECTION_HEADING.exec(trimmed);
    if (subsectionMatch) {
      subsectionGroup = subsectionMatch[1].trim() || null;
      continue;
    }

    if (inIngredienserSection) {
      const boldMatch = BOLD_SUBSECTION.exec(trimmed);
      if (boldMatch) {
        subsectionGroup = boldMatch[1].trim() || null;
        continue;
      }
      const servingPipe = SERVING_PIPE_HEADING.exec(trimmed);
      if (servingPipe) {
        subsectionGroup = normalizeServingGroupLabel(servingPipe[1]);
        continue;
      }
      const servingPlain = SERVING_PLAIN_HEADING.exec(trimmed);
      if (servingPlain) {
        subsectionGroup = normalizeServingGroupLabel(servingPlain[1]);
        continue;
      }
    }

    const activeGroup = inIngredienserSection
      ? subsectionGroup
      : componentGroup;
    const ingredients = activeIngredients();

    if (isIngredientTableHeader(trimmed)) {
      i = consumeIngredientTable(lines, i, ingredients, activeGroup);
      continue;
    }

    if (inIngredienserSection && trimmed.includes("|")) {
      pushTableRow(splitTableRow(trimmed), ingredients, activeGroup);
      continue;
    }

    if (inIngredienserSection) {
      if (isSeparatorLine(trimmed)) {
        continue;
      }
      const bulletMatch = BULLET_LINE.exec(trimmed);
      if (bulletMatch) {
        const name = bulletMatch[1]
          .replace(/&nbsp;/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (name && !HEADER_NAMES.test(name)) {
          const item = { name };
          if (activeGroup) {
            item.group = activeGroup;
          }
          ingredients.push(item);
        }
        continue;
      }
      pushLoneLine(trimmed, ingredients, activeGroup);
    }
  }

  const ingredients = mainIngredients.concat(componentIngredients);
  return ingredients.length > 0 ? ingredients : null;
}

function findIngredienserSectionBounds(lines) {
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const h2Match = trimmed ? /^##\s+(.+)$/.exec(trimmed) : null;
    if (h2Match && isIngredienserHeading(h2Match[1].trim())) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    return null;
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const h2Match = trimmed ? /^##\s+(.+)$/.exec(trimmed) : null;
    if (h2Match) {
      end = i;
      break;
    }
  }
  return { start, end };
}

function skipIngredientTableBlock(lines, headerIndex, end) {
  let i = headerIndex + 1;
  if (i < end && isSeparatorLine(lines[i])) {
    i += 1;
  }
  while (i < end) {
    const row = lines[i].trim();
    if (!row || !row.includes("|") || isIngredientTableHeader(row)) {
      break;
    }
    i += 1;
  }
  return i;
}

/**
 * Free text and non-standard tables inside ## Ingredienser (e.g. "Till servering" notes).
 * @param {string} markdownBody
 * @returns {string}
 */
export function extractIngredienserExtras(markdownBody) {
  if (!markdownBody || typeof markdownBody !== "string") {
    return "";
  }

  const lines = markdownBody.split(/\r?\n/);
  const bounds = findIngredienserSectionBounds(lines);
  if (!bounds) {
    return "";
  }

  const { start, end } = bounds;
  const extras = [];

  for (let i = start + 1; i < end; ) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    const isSubsectionLine =
      SUBSECTION_HEADING.test(trimmed) ||
      BOLD_SUBSECTION.test(trimmed) ||
      SERVING_PLAIN_HEADING.test(trimmed) ||
      SERVING_PIPE_HEADING.test(trimmed);

    if (isSubsectionLine) {
      let j = i + 1;
      while (j < end && !lines[j].trim()) {
        j += 1;
      }
      if (j < end && isIngredientTableHeader(lines[j].trim())) {
        i = skipIngredientTableBlock(lines, j, end);
        continue;
      }
      i += 1;
      while (i < end) {
        const t = lines[i].trim();
        if (!t) {
          i += 1;
          continue;
        }
        if (
          SUBSECTION_HEADING.test(t) ||
          BOLD_SUBSECTION.test(t) ||
          SERVING_PLAIN_HEADING.test(t) ||
          SERVING_PIPE_HEADING.test(t)
        ) {
          break;
        }
        if (isIngredientTableHeader(t)) {
          break;
        }
        i += 1;
      }
      continue;
    }

    if (isSeparatorLine(trimmed)) {
      i += 1;
      continue;
    }

    if (isIngredientTableHeader(trimmed)) {
      i = skipIngredientTableBlock(lines, i, end);
      continue;
    }

    extras.push(lines[i]);
    i += 1;
  }

  return extras
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Remove classic ## Ingredienser sections and ingredient tables under other ## headings.
 * @param {string} markdownBody
 * @returns {string}
 */
export function removeIngredientsSection(markdownBody) {
  if (!markdownBody || typeof markdownBody !== "string") {
    return markdownBody || "";
  }

  const lines = markdownBody.split(/\r?\n/);
  const drop = new Set();
  let inIngredienserSection = false;
  let ingredienserStart = -1;
  let stopped = false;

  for (let i = 0; i < lines.length && !stopped; i += 1) {
    const trimmed = lines[i].trim();

    const h2Match = trimmed ? /^##\s+(.+)$/.exec(trimmed) : null;
    if (h2Match) {
      const h2Title = h2Match[1].trim();

      if (inIngredienserSection && ingredienserStart >= 0) {
        for (let j = ingredienserStart; j < i; j += 1) {
          drop.add(j);
        }
        inIngredienserSection = false;
        ingredienserStart = -1;
      }

      if (isTillagningHeading(h2Title)) {
        stopped = true;
        break;
      }

      if (isIngredienserHeading(h2Title)) {
        inIngredienserSection = true;
        ingredienserStart = i;
        continue;
      }

      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) {
        j += 1;
      }
      if (j < lines.length && isIngredientTableHeader(lines[j].trim())) {
        drop.add(i);
        while (j < lines.length) {
          const row = lines[j].trim();
          if (!row || !row.includes("|")) {
            break;
          }
          drop.add(j);
          j += 1;
        }
        i = j - 1;
      }
      continue;
    }

    if (inIngredienserSection && ingredienserStart < 0) {
      ingredienserStart = i;
    }
  }

  if (inIngredienserSection && ingredienserStart >= 0) {
    for (let j = ingredienserStart; j < lines.length; j += 1) {
      drop.add(j);
    }
  }

  const kept = lines.filter((_, index) => !drop.has(index));
  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
