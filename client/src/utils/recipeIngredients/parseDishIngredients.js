import {
  compact,
  filter as filterFp,
  flow,
  get,
  map,
  orderBy,
  uniq,
  values,
} from "lodash/fp";

import { parseFrontMatter } from "../../components/markdown/parseFrontMatter";
import { parseIngredientsFromFrontmatter } from "./parseIngredientsFromFrontmatter";
import {
  INGREDIENT_GROUP_DEFS,
  normalizedIngredientIdAssignedGroupId,
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

export const MIN_RECIPES_TO_LIST_INGREDIENT = 4;

export function parseDishIngredients(description) {
  const raw = parseIngredientsFromFrontmatter(
    parseFrontMatter(description).data
  );
  const displayIngredients = flow(
    map((item) => ({
      ...item,
      normalizedIngredientId: getIngredientId(item.name),
    })),
    filterFp((item) => item.normalizedIngredientId)
  )(raw || []);

  return {
    displayIngredients,
    normalizedIngredientIds: displayIngredients.length
      ? flow(map(get("normalizedIngredientId")), uniq)(displayIngredients)
      : null,
  };
}

const pickMostCommonName = (counts) =>
  orderBy(
    [(name) => counts[name], (name) => name],
    ["desc", "asc"]
  )(Object.keys(counts || {}))[0] || "";

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
    const { normalizedIngredientIds, displayIngredients } = parsed;
    if (!normalizedIngredientIds) return;

    dishIndex.set(dish.id, normalizedIngredientIds);
    for (const id of normalizedIngredientIds) {
      recipeCountById[id] = (recipeCountById[id] || 0) + 1;
    }
    for (const groupId of new Set(
      compact(
        normalizedIngredientIds.map(normalizedIngredientIdAssignedGroupId)
      )
    )) {
      groupRecipeCount[groupId] += 1;
    }
    for (const item of displayIngredients) {
      const { normalizedIngredientId: id, name: rawName } = item;
      const name = (rawName || "").trim();
      if (!id || !name || isFinderExcludedIngredient(id)) continue;
      if (!nameCounts[id]) nameCounts[id] = {};
      nameCounts[id][name] = (nameCounts[id][name] || 0) + 1;
      if (!byId[id]) {
        byId[id] = {
          id,
          label: name,
          recipeCount: 0,
          hiddenFromDefaultList:
            isFinderExcludedIngredient(id) ||
            Boolean(normalizedIngredientIdAssignedGroupId(id)),
        };
      }
    }
  });

  for (const id of Object.keys(byId)) {
    byId[id].label = formatFinderLabel(pickMostCommonName(nameCounts[id]));
    byId[id].recipeCount = recipeCountById[id] || 0;
  }

  for (const def of INGREDIENT_GROUP_DEFS) {
    const memberIds = Object.keys(recipeCountById).filter(
      (id) =>
        normalizedIngredientIdAssignedGroupId(id) === def.id &&
        !isFinderExcludedIngredient(id)
    );
    const recipeCount = groupRecipeCount[def.id] || 0;
    if (!memberIds.length || recipeCount < MIN_RECIPES_TO_LIST_INGREDIENT) {
      continue;
    }
    byId[def.id] = {
      id: def.id,
      label: formatFinderLabel(def.label),
      recipeCount,
      memberIds,
      isCollapsedGroup: true,
    };
  }

  const catalog = sortFinderCatalogEntries(values(byId));
  const labelById = new Map(catalog.map((ing) => [ing.id, ing.label]));

  return {
    catalog,
    getLabel: (id) =>
      labelById.get(id) || formatFinderLabel(getIngredientLabel(id)),
    dishIndex,
  };
}

export const isFinderChipVisibleByDefault = (ing) =>
  !!ing &&
  !ing.hiddenFromDefaultList &&
  (ing.isCollapsedGroup ||
    (!normalizedIngredientIdAssignedGroupId(ing.id) &&
      ing.recipeCount >= MIN_RECIPES_TO_LIST_INGREDIENT));

export function expandFindSelection(selectedIds, catalog) {
  const byId = new Map((catalog || []).map((ing) => [ing.id, ing]));
  const out = [];
  const seen = new Set();
  const add = (id) => {
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  };
  const expandOne = (id) => {
    if (isFinderSearchSelectionId(id)) {
      filterIngredientsByLooseSearch(
        catalog,
        finderSearchSelectionQuery(id)
      ).forEach((hit) => expandOne(hit.id));
      return;
    }
    const entry = byId.get(id);
    if (entry?.memberIds?.length) entry.memberIds.forEach(add);
    else expandIngredientLabelVariantIds(id, catalog).forEach(add);
  };
  (selectedIds || []).forEach(expandOne);
  return out;
}

export const sortFinderCatalogEntries = orderBy(
  ["recipeCount", "label"],
  ["desc", "asc"]
);
