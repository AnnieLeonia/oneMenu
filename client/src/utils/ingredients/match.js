import { compact, filter, flow, map, orderBy, size, toLower } from "lodash/fp";

import { getIngredientLabel } from "./normalize";
import { parseDish } from "./catalog";
import { isSearchChipId, labelMatchesSearch, searchChipQuery } from "./search";

const sortMatchResults = orderBy(
  [(r) => r.matched, (r) => toLower(r.dish.name || "")],
  ["desc", "asc"]
);

const dishIndexForDishes = (dishes) =>
  (dishes || []).reduce((index, dish) => {
    const { normalizedIngredientIds } = parseDish(dish.description);
    if (normalizedIngredientIds) index.set(dish.id, normalizedIngredientIds);
    return index;
  }, new Map());

const chipLabel = (getLabel) => (id) =>
  isSearchChipId(id) ? searchChipQuery(id) : getLabel(id);

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
    chipLabels.some((q) => labelMatchesSearch(getLabel(id), q));

  return sortMatchResults(
    flow(
      map((dish) => {
        const dishIds = dishIndex.get(dish.id);
        if (!dishIds?.length) return null;
        const matched = filter(matchesSelection)(dishIds).length;
        return matched ? { dish, matched, total: dishIds.length } : null;
      }),
      compact
    )(dishes || [])
  );
}
