import { parseDescription } from "./parseDescription";
import { parseIngredientsFromFrontmatter } from "./parseIngredientsFromFrontmatter";
import { parseIngredientsFromTable } from "./parseIngredientsFromTable";
import {
  getIngredientCategory,
  getIngredientId,
  getIngredientLabel,
} from "./normalizeIngredient";

/**
 * Parse a dish description into normalized ingredients for matching.
 * Prefer YAML frontmatter; fall back to ## Ingredienser table in the body only.
 *
 * @param {string|null|undefined} description
 * @returns {{
 *   source: 'frontmatter'|'table'|null,
 *   displayIngredients: Array<{ name: string, quantity?: *, unit?: string, group?: string, canonicalId: string|null }>,
 *   canonicalIds: string[]|null
 * }}
 */
export function parseDishIngredients(description) {
  const { data, content } = parseDescription(description);

  let raw = parseIngredientsFromFrontmatter(data);
  let source = "frontmatter";

  if (!raw) {
    raw = parseIngredientsFromTable(content);
    source = "table";
  }

  if (!raw) {
    return {
      source: null,
      displayIngredients: [],
      canonicalIds: null,
    };
  }

  const displayIngredients = raw
    .map((item) => ({
      ...item,
      canonicalId: getIngredientId(item.name),
    }))
    .filter((item) => item.canonicalId);

  const seen = {};
  const canonicalIds = [];
  displayIngredients.forEach((item) => {
    if (!seen[item.canonicalId]) {
      seen[item.canonicalId] = true;
      canonicalIds.push(item.canonicalId);
    }
  });

  if (displayIngredients.length === 0) {
    return {
      source: raw ? source : null,
      displayIngredients: [],
      canonicalIds: null,
    };
  }

  return {
    source,
    displayIngredients,
    canonicalIds,
  };
}

function pickMostCommonName(counts) {
  let best = "";
  let bestCount = -1;
  Object.keys(counts || {}).forEach((name) => {
    const n = counts[name];
    if (
      n > bestCount ||
      (n === bestCount &&
        name.localeCompare(best, "sv", { sensitivity: "base" }) < 0)
    ) {
      best = name;
      bestCount = n;
    }
  });
  return best;
}

/**
 * Catalog + labels derived from dish descriptions (Swedish names as written in recipes).
 * @param {Array<{ id: number, description?: string }>} dishes
 * @returns {{
 *   catalog: Array<{ id: string, label: string, category: string }>,
 *   getLabel: (id: string) => string
 * }}
 */
export function buildFindIngredientContext(dishes) {
  const nameCounts = {};
  const byId = {};

  (dishes || []).forEach((dish) => {
    const parsed = parseDishIngredients(dish.description);
    if (!parsed.canonicalIds) return;
    parsed.displayIngredients.forEach((item) => {
      const id = item.canonicalId;
      const name = (item.name || "").trim();
      if (!id || !name) return;
      if (!nameCounts[id]) nameCounts[id] = {};
      nameCounts[id][name] = (nameCounts[id][name] || 0) + 1;
      if (!byId[id]) {
        byId[id] = {
          id,
          label: name,
          category: getIngredientCategory(id),
        };
      }
    });
  });

  Object.keys(byId).forEach((id) => {
    byId[id].label = pickMostCommonName(nameCounts[id]);
  });

  const catalog = Object.values(byId).sort((a, b) =>
    a.label.localeCompare(b.label, "sv", { sensitivity: "base" })
  );

  const labelById = {};
  catalog.forEach((ing) => {
    labelById[ing.id] = ing.label;
  });

  return {
    catalog,
    getLabel: (id) => labelById[id] || getIngredientLabel(id),
  };
}

/**
 * @deprecated Use buildFindIngredientContext
 */
export function buildIngredientCatalog(dishes, getLabel) {
  const ctx = buildFindIngredientContext(dishes);
  if (!getLabel) return ctx.catalog;
  return ctx.catalog.map((ing) => ({
    ...ing,
    label: getLabel(ing.id),
  }));
}
