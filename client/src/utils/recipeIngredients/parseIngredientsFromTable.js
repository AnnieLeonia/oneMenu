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

function isIngredientTableHeader(line) {
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
