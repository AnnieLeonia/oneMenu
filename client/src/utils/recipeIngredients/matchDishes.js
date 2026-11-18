import { compact, flow, map, orderBy, toLower } from "lodash/fp";

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

function dishIngredientMatchesSelection(dishCanonicalId, chipLabels) {
  const dishLabel = getIngredientLabel(dishCanonicalId);
  return (
    Boolean(dishLabel) &&
    chipLabels.some((chipLabel) =>
      ingredientLabelMatchesSearch(dishLabel, chipLabel)
    )
  );
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
    map((id) =>
      isFinderSearchSelectionId(id)
        ? finderSearchSelectionQuery(id)
        : labelFor(id)
    ),
    compact
  )(chipIds);
  const dishIndex = index || dishIndexForDishes(dishes);

  return sortMatchResults(
    compact(
      map((dish) => {
        const dishIds = dishIndex.get(dish.id);
        if (!dishIds?.length) return null;
        const matched = dishIds.filter(
          (id) =>
            selected.has(id) || dishIngredientMatchesSelection(id, chipLabels)
        ).length;
        return matched > 0 ? { dish, matched, total: dishIds.length } : null;
      })(dishes || [])
    )
  );
}
