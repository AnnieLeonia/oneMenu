import { compact, flow, map, orderBy, some, toLower } from "lodash/fp";

import { getIngredientLabel } from "./normalizeIngredient";
import { parseDishIngredients } from "./parseDishIngredients";
import {
  finderChipSearchLabel,
  ingredientLabelMatchesSearch,
} from "./searchIngredients";

const sortMatchResults = orderBy(
  [(r) => r.matched, (r) => toLower(r.dish.name || "")],
  ["desc", "asc"]
);

function dishIngredientMatchesSelection(dishCanonicalId, chipLabels) {
  const dishLabel = getIngredientLabel(dishCanonicalId);
  if (!dishLabel) return false;
  return some((chipLabel) =>
    ingredientLabelMatchesSearch(dishLabel, chipLabel)
  )(chipLabels);
}

function dishIndexForDishes(dishes) {
  const index = new Map();
  (dishes || []).forEach((dish) => {
    const { canonicalIds } = parseDishIngredients(dish.description);
    if (canonicalIds) index.set(dish.id, canonicalIds);
  });
  return index;
}

/**
 * Match selected ingredients against indexed dishes.
 * Only dishes with at least one matching ingredient are returned.
 *
 * @param {Array<object>} dishes
 * @param {string[]} selectedIds
 * @param {Map} [index]
 * @returns {Array<{ dish: object, matched: number, total: number }>}
 */
export function matchDishes(
  dishes,
  selectedIds,
  index,
  getLabel,
  selectionChipIds = selectedIds
) {
  const selected = new Set(selectedIds || []);
  if (selected.size === 0) return [];

  const labelFor = getLabel || getIngredientLabel;
  const chipIds = selectionChipIds || selectedIds || [];
  const chipLabels = flow(
    map((id) => finderChipSearchLabel(id, labelFor)),
    compact
  )(chipIds);
  const dishIndex = index || dishIndexForDishes(dishes);
  const results = [];

  (dishes || []).forEach((dish) => {
    const dishIds = dishIndex.get(dish.id);
    if (!dishIds?.length) return;
    let matched = 0;

    dishIds.forEach((id) => {
      if (selected.has(id) || dishIngredientMatchesSelection(id, chipLabels)) {
        matched += 1;
      }
    });

    if (matched < 1) return;

    results.push({
      dish,
      matched,
      total: dishIds.length,
    });
  });

  return sortMatchResults(results);
}
