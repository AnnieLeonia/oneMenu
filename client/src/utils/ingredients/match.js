import { compact, flow, map, orderBy, size, toLower } from "lodash/fp";

import { getIngredientLabel } from "./normalize";
import { isSearchChipId, labelMatchesSearch, searchChipQuery } from "./search";

const sortMatchResults = orderBy(
  [(r) => r.matched, (r) => toLower(r.dish.name || "")],
  ["desc", "asc"]
);

export function matchDishes(
  dishes,
  selectedIds,
  dishIndex,
  getLabel = getIngredientLabel,
  selectionChipIds = selectedIds
) {
  const selected = new Set(selectedIds || []);
  if (!size(selected)) return [];

  const chipLabels = flow(
    map((id) => (isSearchChipId(id) ? searchChipQuery(id) : getLabel(id))),
    compact
  )(selectionChipIds || []);
  const matchesSelection = (id) =>
    selected.has(id) ||
    chipLabels.some((q) => labelMatchesSearch(getLabel(id), q));

  return sortMatchResults(
    flow(
      map((dish) => {
        const dishIds = dishIndex.get(dish.id);
        if (!dishIds?.length) return null;
        const matched = dishIds.filter(matchesSelection).length;
        return matched ? { dish, matched, total: dishIds.length } : null;
      }),
      compact
    )(dishes || [])
  );
}
