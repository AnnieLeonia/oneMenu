import { compact, filter, flow, map, orderBy, size, toLower } from "lodash/fp";

import { getIngredientLabel } from "./normalizeIngredient";
import { parseDishIngredients } from "./parseDishIngredients";
import {
  finderSearchSelectionQuery,
  ingredientLabelMatchesSearch,
  isFinderSearchSelectionId,
} from "./searchIngredients";

const sortMatchResults = orderBy(
  [(r) => r.matched, (r) => toLower(r.dish.name || "")],
  ["desc", "asc"]
);

const dishIndexForDishes = (dishes) =>
  (dishes || []).reduce((index, dish) => {
    const { normalizedIngredientIds } = parseDishIngredients(dish.description);
    if (normalizedIngredientIds) index.set(dish.id, normalizedIngredientIds);
    return index;
  }, new Map());

const chipLabel = (getLabel) => (id) =>
  isFinderSearchSelectionId(id) ? finderSearchSelectionQuery(id) : getLabel(id);

export function matchDishes(
  dishes,
  selectedIds,
  index,
  getLabel = getIngredientLabel,
  selectionChipIds = selectedIds
) {
  const selected = new Set(selectedIds || []);
  if (!size(selected)) return [];

  const chipLabels = flow(
    map(chipLabel(getLabel)),
    compact
  )(selectionChipIds || []);
  const dishIndex = index || dishIndexForDishes(dishes);
  const matchesSelection = (id) =>
    selected.has(id) ||
    chipLabels.some((q) => ingredientLabelMatchesSearch(getLabel(id), q));

  return sortMatchResults(
    compact(
      map((dish) => {
        const dishIds = dishIndex.get(dish.id);
        if (!dishIds?.length) return null;
        const matched = filter(matchesSelection)(dishIds).length;
        return matched ? { dish, matched, total: dishIds.length } : null;
      })(dishes || [])
    )
  );
}
