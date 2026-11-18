import {
  filter as filterFp,
  flatMap,
  flow,
  map,
  uniq,
  uniqBy,
  values,
} from "lodash/fp";

import { parseFrontMatter } from "../../components/markdown/parseFrontMatter";
import { parseIngredientsFromFrontmatter } from "./parseIngredientsFromFrontmatter";
import { parseIngredientsFromTable } from "./parseIngredientsFromTable";
import {
  INGREDIENT_GROUP_DEFS,
  canonicalIdAssignedGroupId,
} from "./ingredientGroups";
import {
  expandIngredientLabelVariantIds,
  filterIngredientsByLooseSearch,
  finderSearchSelectionQuery,
  isFinderSearchSelectionId,
} from "./searchIngredients";
import {
  getIngredientId,
  formatFinderLabel,
  getIngredientLabel,
  isFinderExcludedIngredient,
} from "./normalizeIngredient";

/** Visa bara ingredienser som förekommer i minst fyra recept. */
export const MIN_RECIPES_TO_LIST_INGREDIENT = 4;

function mergeIngredientLists(...lists) {
  const merged = flow(
    flatMap((list) => list || []),
    filterFp((item) => item?.name && getIngredientId(item.name)),
    uniqBy((item) => getIngredientId(item.name))
  )(lists);
  return merged.length ? merged : null;
}

/**
 * Parse a dish description into normalized ingredients for matching.
 * Prefer YAML frontmatter; fall back to ## Ingredienser table in the body only.
 *
 * @param {string|null|undefined} description
 * @returns {{
 *   displayIngredients: Array<{ name: string, quantity?: *, unit?: string, group?: string, canonicalId: string|null }>,
 *   canonicalIds: string[]|null
 * }}
 */
export function parseDishIngredients(description) {
  const { data, content } = parseFrontMatter(description);

  const raw = mergeIngredientLists(
    parseIngredientsFromFrontmatter(data),
    parseIngredientsFromTable(content)
  );

  if (!raw) {
    return {
      displayIngredients: [],
      canonicalIds: null,
    };
  }

  const displayIngredients = flow(
    map((item) => ({
      ...item,
      canonicalId: getIngredientId(item.name),
    })),
    filterFp((item) => item.canonicalId)
  )(raw);

  return {
    displayIngredients,
    canonicalIds: displayIngredients.length
      ? flow(
          map((item) => item.canonicalId),
          uniq
        )(displayIngredients)
      : null,
  };
}

function pickMostCommonName(counts) {
  const names = Object.keys(counts || {});
  if (!names.length) return "";
  return names.reduce((best, name) => {
    const n = counts[name];
    const bestN = counts[best];
    return n > bestN ||
      (n === bestN &&
        name.localeCompare(best, "sv", { sensitivity: "base" }) < 0)
      ? name
      : best;
  });
}

/**
 * Catalog + labels derived from dish descriptions (Swedish names as written in recipes).
 * @param {Array<{ id: number, description?: string }>} dishes
 * @returns {{
 *   catalog: Array<{ id: string, label: string, category: string }>,
 *   getLabel: (id: string) => string,
 *   dishIndex: Map<number, string[]>
 * }}
 */
export function buildFindIngredientContext(dishes) {
  const nameCounts = {};
  const recipeCountById = {};
  const byId = {};
  const groupRecipeCount = Object.fromEntries(
    INGREDIENT_GROUP_DEFS.map((def) => [def.id, 0])
  );
  const dishIndex = new Map();

  (dishes || []).forEach((dish) => {
    const parsed = parseDishIngredients(dish.description);
    if (!parsed.canonicalIds) return;
    dishIndex.set(dish.id, parsed.canonicalIds);
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
      const groupId = canonicalIdAssignedGroupId(id);
      const collapsedMember = Boolean(groupId);
      if (!nameCounts[id]) nameCounts[id] = {};
      nameCounts[id][name] = (nameCounts[id][name] || 0) + 1;
      if (!byId[id]) {
        byId[id] = {
          id,
          label: name,
          recipeCount: 0,
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

  INGREDIENT_GROUP_DEFS.forEach((def) => {
    const memberIds = Object.keys(recipeCountById).filter(
      (id) =>
        canonicalIdAssignedGroupId(id) === def.id &&
        !isFinderExcludedIngredient(id)
    );
    if (memberIds.length === 0) return;
    const recipeCount = groupRecipeCount[def.id] || 0;
    if (recipeCount < MIN_RECIPES_TO_LIST_INGREDIENT) return;
    byId[def.id] = {
      id: def.id,
      label: formatFinderLabel(def.label),
      recipeCount,
      memberIds,
      isCollapsedGroup: true,
    };
  });

  const catalog = sortFinderCatalogEntries(values(byId));
  const labelById = new Map(catalog.map((ing) => [ing.id, ing.label]));

  return {
    catalog,
    getLabel: (id) =>
      labelById.get(id) || formatFinderLabel(getIngredientLabel(id)),
    dishIndex,
  };
}

/** Default finder chip list (no search): family chips, listable singles, not staples. */
export function isFinderChipVisibleByDefault(ing) {
  if (!ing || ing.hiddenFromDefaultList) return false;
  if (ing.isCollapsedGroup) return true;
  if (canonicalIdAssignedGroupId(ing.id)) return false;
  return ing.recipeCount >= MIN_RECIPES_TO_LIST_INGREDIENT;
}

function expandOneSelectionId(id, catalog, byId, add) {
  if (isFinderSearchSelectionId(id)) {
    filterIngredientsByLooseSearch(
      catalog,
      finderSearchSelectionQuery(id)
    ).forEach((hit) => expandOneSelectionId(hit.id, catalog, byId, add));
    return;
  }
  const entry = byId.get(id);
  if (entry?.memberIds?.length) {
    entry.memberIds.forEach(add);
  } else if (id) {
    expandIngredientLabelVariantIds(id, catalog).forEach(add);
  }
}

export function expandFindSelection(selectedIds, catalog) {
  const byId = new Map((catalog || []).map((ing) => [ing.id, ing]));
  const seen = new Set();
  const expanded = [];
  const add = (variantId) => {
    if (!variantId || seen.has(variantId)) return;
    seen.add(variantId);
    expanded.push(variantId);
  };
  (selectedIds || []).forEach((id) =>
    expandOneSelectionId(id, catalog, byId, add)
  );
  return expanded;
}

export function sortFinderCatalogEntries(items) {
  return [...(items || [])].sort((a, b) =>
    a.recipeCount !== b.recipeCount
      ? b.recipeCount - a.recipeCount
      : a.label.localeCompare(b.label, "sv", { sensitivity: "base" })
  );
}
