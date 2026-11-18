import { parseFrontMatter } from "../../components/markdown/parseFrontMatter";
import { parseIngredientsFromFrontmatter } from "./parseIngredientsFromFrontmatter";
import { parseIngredientsFromTable } from "./parseIngredientsFromTable";
import {
  INGREDIENT_GROUP_DEFS,
  canonicalIdAssignedGroupId,
  getAssignedGroupDef,
  groupMatchesCanonicalId,
  isIngredientCoveredByGroups,
} from "./ingredientGroups";
import {
  expandIngredientLabelVariantIds,
  filterIngredientsByLooseSearch,
  finderSearchSelectionQuery,
  isFinderSearchSelectionId,
} from "./searchIngredients";
import {
  getIngredientCategory,
  getIngredientId,
  formatFinderLabel,
  getIngredientLabel,
  isFinderExcludedIngredient,
} from "./normalizeIngredient";

/** Visa bara ingredienser som förekommer i minst fyra recept. */
export const MIN_RECIPES_TO_LIST_INGREDIENT = 4;

function mergeIngredientLists(...lists) {
  const byId = new Map();
  lists.forEach((list) => {
    (list || []).forEach((item) => {
      if (!item?.name) return;
      const id = getIngredientId(item.name);
      if (!id || byId.has(id)) return;
      byId.set(id, item);
    });
  });
  return byId.size ? Array.from(byId.values()) : null;
}

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
  const { data, content } = parseFrontMatter(description);

  const fromFrontmatter = parseIngredientsFromFrontmatter(data);
  const fromTable = parseIngredientsFromTable(content);
  const raw = mergeIngredientLists(fromFrontmatter, fromTable);

  let source = null;
  if (fromFrontmatter && fromTable) {
    source = "both";
  } else if (fromFrontmatter) {
    source = "frontmatter";
  } else if (fromTable) {
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

  const canonicalIds = [
    ...new Set(displayIngredients.map((item) => item.canonicalId)),
  ];

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
  const recipeCountById = {};
  const byId = {};
  const groupRecipeCount = {};
  INGREDIENT_GROUP_DEFS.forEach((def) => {
    groupRecipeCount[def.id] = 0;
  });

  (dishes || []).forEach((dish) => {
    const parsed = parseDishIngredients(dish.description);
    if (!parsed.canonicalIds) return;
    const groupsInDish = new Set();
    parsed.canonicalIds.forEach((id) => {
      recipeCountById[id] = (recipeCountById[id] || 0) + 1;
      const groupId = canonicalIdAssignedGroupId(id);
      if (groupId) groupsInDish.add(groupId);
    });
    groupsInDish.forEach((groupId) => {
      groupRecipeCount[groupId] += 1;
    });
    parsed.displayIngredients.forEach((item) => {
      const id = item.canonicalId;
      const name = (item.name || "").trim();
      if (!id || !name) return;
      const group = getAssignedGroupDef(id);
      const collapsedMember = Boolean(group?.collapseToSingle);
      if (!nameCounts[id]) nameCounts[id] = {};
      nameCounts[id][name] = (nameCounts[id][name] || 0) + 1;
      if (!byId[id]) {
        byId[id] = {
          id,
          label: name,
          category: getIngredientCategory(id),
          recipeCount: 0,
          isCollapsedMember: collapsedMember,
          coveredByGroup: Boolean(group),
          hiddenFromDefaultList:
            isFinderExcludedIngredient(id) || collapsedMember,
        };
      }
    });
  });

  Object.keys(byId).forEach((id) => {
    byId[id].label = formatFinderLabel(pickMostCommonName(nameCounts[id]));
    byId[id].recipeCount = recipeCountById[id] || 0;
  });

  const sortByPopularityDesc = (a, b) => {
    if (a.recipeCount !== b.recipeCount) {
      return b.recipeCount - a.recipeCount;
    }
    return a.label.localeCompare(b.label, "sv", { sensitivity: "base" });
  };

  INGREDIENT_GROUP_DEFS.filter((def) => def.collapseToSingle).forEach((def) => {
    const memberIds = Object.keys(recipeCountById).filter(
      (id) =>
        groupMatchesCanonicalId(def, id) && !isFinderExcludedIngredient(id)
    );
    if (memberIds.length === 0) return;
    const recipeCount = groupRecipeCount[def.id] || 0;
    if (recipeCount < MIN_RECIPES_TO_LIST_INGREDIENT) return;
    byId[def.id] = {
      id: def.id,
      label: formatFinderLabel(def.label),
      category: getIngredientCategory(def.id),
      recipeCount,
      memberIds,
      isCollapsedGroup: true,
      coveredByGroup: false,
    };
  });

  const catalog = Object.values(byId).sort(sortByPopularityDesc);

  const labelById = {};
  catalog.forEach((ing) => {
    labelById[ing.id] = ing.label;
  });

  return {
    catalog,
    getLabel: (id) =>
      labelById[id] || formatFinderLabel(getIngredientLabel(id)),
  };
}

/** Default finder chip list (no search): family chips, listable singles, not staples. */
export function isFinderChipVisibleByDefault(ing) {
  if (!ing || ing.hiddenFromDefaultList) return false;
  if (ing.isCollapsedGroup) return true;
  if (isIngredientCoveredByGroups(ing.id)) return false;
  return ing.recipeCount >= MIN_RECIPES_TO_LIST_INGREDIENT;
}

/**
 * @param {string[]} selectedIds
 * @param {Array<{ id: string, memberIds?: string[] }>} catalog
 */
function appendExpandedIds(expanded, ids) {
  (ids || []).forEach((variantId) => {
    if (variantId && !expanded.includes(variantId)) expanded.push(variantId);
  });
}

export function expandFindSelection(selectedIds, catalog) {
  const byId = new Map((catalog || []).map((ing) => [ing.id, ing]));
  const expanded = [];
  (selectedIds || []).forEach((id) => {
    if (isFinderSearchSelectionId(id)) {
      const query = finderSearchSelectionQuery(id);
      const hits = filterIngredientsByLooseSearch(catalog, query);
      hits.forEach((hit) => {
        expandFindSelection([hit.id], catalog).forEach((memberId) => {
          if (!expanded.includes(memberId)) expanded.push(memberId);
        });
      });
      return;
    }
    const entry = byId.get(id);
    if (entry?.memberIds?.length) {
      appendExpandedIds(expanded, entry.memberIds);
    } else if (id) {
      appendExpandedIds(expanded, expandIngredientLabelVariantIds(id, catalog));
    }
  });
  return expanded;
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
