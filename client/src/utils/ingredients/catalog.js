import {
  compact,
  filter,
  flow,
  get,
  map,
  orderBy,
  uniq,
  values,
} from "lodash/fp";

import { parseDishIngredients } from "./frontmatter";
import { INGREDIENT_GROUP_DEFS, groupIdFor } from "./groups";
import {
  expandLabelVariants,
  filterBySearch,
  isSearchChipId,
  searchChipQuery,
} from "./search";
import {
  getIngredientId,
  formatLabel,
  getIngredientLabel,
  isExcludedFromPicker,
} from "./normalize";

const MIN_LIST_RECIPE_COUNT = 4;

export function parseDish(description) {
  const raw = parseDishIngredients(description);
  if (!raw?.length)
    return { displayIngredients: [], normalizedIngredientIds: null };

  const displayIngredients = flow(
    map((item) => {
      const normalizedIngredientId = getIngredientId(item.name);
      return normalizedIngredientId && { ...item, normalizedIngredientId };
    }),
    compact
  )(raw);

  const normalizedIngredientIds = flow(
    map(get("normalizedIngredientId")),
    uniq
  )(displayIngredients);

  return {
    displayIngredients,
    normalizedIngredientIds: normalizedIngredientIds.length
      ? normalizedIngredientIds
      : null,
  };
}

const pickMostCommonName = (counts) =>
  orderBy(
    [(name) => counts[name], (name) => name],
    ["desc", "asc"]
  )(Object.keys(counts || {}))[0] || "";

export function buildCatalog(dishes) {
  const nameCounts = {};
  const recipeCountById = {};
  const byId = {};
  const groupRecipeCount = Object.fromEntries(
    INGREDIENT_GROUP_DEFS.map((def) => [def.id, 0])
  );
  const dishIndex = new Map();

  (dishes || []).forEach((dish) => {
    const parsed = parseDish(dish.description);
    const { normalizedIngredientIds, displayIngredients } = parsed;
    if (!normalizedIngredientIds) return;

    dishIndex.set(dish.id, normalizedIngredientIds);
    for (const id of normalizedIngredientIds) {
      recipeCountById[id] = (recipeCountById[id] || 0) + 1;
    }
    for (const groupId of new Set(
      compact(normalizedIngredientIds.map(groupIdFor))
    )) {
      groupRecipeCount[groupId] += 1;
    }
    for (const item of displayIngredients) {
      const { normalizedIngredientId: id, name: rawName } = item;
      const name = (rawName || "").trim();
      if (!id || !name || isExcludedFromPicker(id)) continue;
      if (!nameCounts[id]) nameCounts[id] = {};
      nameCounts[id][name] = (nameCounts[id][name] || 0) + 1;
      if (!byId[id]) {
        byId[id] = {
          id,
          label: name,
          recipeCount: 0,
          hiddenFromDefaultList: Boolean(groupIdFor(id)),
        };
      }
    }
  });

  for (const id of Object.keys(byId)) {
    byId[id].label = formatLabel(pickMostCommonName(nameCounts[id]));
    byId[id].recipeCount = recipeCountById[id] || 0;
  }

  for (const def of INGREDIENT_GROUP_DEFS) {
    const memberIds = filter((id) => groupIdFor(id) === def.id)(
      Object.keys(recipeCountById)
    );
    const recipeCount = groupRecipeCount[def.id] || 0;
    if (!memberIds.length || recipeCount < MIN_LIST_RECIPE_COUNT) {
      continue;
    }
    byId[def.id] = {
      id: def.id,
      label: formatLabel(def.label),
      recipeCount,
      memberIds,
      isCollapsedGroup: true,
    };
  }

  const catalog = sortCatalog(values(byId));
  const labelById = new Map(catalog.map((ing) => [ing.id, ing.label]));

  return {
    catalog,
    getLabel: (id) => labelById.get(id) || formatLabel(getIngredientLabel(id)),
    dishIndex,
  };
}

export const isDefaultChip = (ing) =>
  !!ing &&
  !ing.hiddenFromDefaultList &&
  (ing.isCollapsedGroup ||
    (!groupIdFor(ing.id) && ing.recipeCount >= MIN_LIST_RECIPE_COUNT));

export function expandSelection(selectedIds, catalog) {
  const byId = new Map((catalog || []).map((ing) => [ing.id, ing]));
  const seen = new Set();
  const expandOne = (id) => {
    if (isSearchChipId(id)) {
      filterBySearch(catalog, searchChipQuery(id)).forEach(({ id: hitId }) =>
        expandOne(hitId)
      );
      return;
    }
    const entry = byId.get(id);
    const ids = entry?.memberIds?.length
      ? entry.memberIds
      : expandLabelVariants(id, catalog);
    ids.forEach((memberId) => memberId && seen.add(memberId));
  };
  (selectedIds || []).forEach(expandOne);
  return [...seen];
}

export const sortCatalog = orderBy(["recipeCount", "label"], ["desc", "asc"]);
