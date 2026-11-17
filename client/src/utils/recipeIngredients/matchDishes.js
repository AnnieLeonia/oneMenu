import { getIngredientLabel } from "./normalizeIngredient";
import { parseDishIngredients } from "./parseDishIngredients";

/**
 * Index dishes for ingredient matching.
 * @param {Array<object>} dishes
 * @returns {Map<number, { canonicalIds: string[], displayIngredients: Array, source: string }>}
 */
export function buildDishIngredientIndex(dishes) {
  const index = new Map();

  (dishes || []).forEach((dish) => {
    const parsed = parseDishIngredients(dish.description);
    if (!parsed.canonicalIds) return;
    index.set(dish.id, {
      canonicalIds: parsed.canonicalIds,
      displayIngredients: parsed.displayIngredients,
      source: parsed.source,
    });
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
 * @returns {Array<{
 *   dish: object,
 *   matched: number,
 *   missing: number,
 *   total: number,
 *   missingIds: string[],
 *   missingNames: string[],
 *   score: number
 * }>}
 */
export function matchDishes(dishes, selectedIds, index, getLabel) {
  const selected = new Set(selectedIds || []);
  if (selected.size === 0) return [];

  const labelFor = getLabel || getIngredientLabel;
  const dishIndex = index || buildDishIngredientIndex(dishes);
  const results = [];

  (dishes || []).forEach((dish) => {
    const entry = dishIndex.get(dish.id);
    if (!entry || !entry.canonicalIds.length) return;

    const dishIds = entry.canonicalIds;
    let matched = 0;
    const missingIds = [];

    dishIds.forEach((id) => {
      if (selected.has(id)) {
        matched += 1;
      } else {
        missingIds.push(id);
      }
    });

    if (matched < 1) return;

    const total = dishIds.length;
    const missing = missingIds.length;
    const score = total > 0 ? matched / total : 0;

    results.push({
      dish,
      matched,
      missing,
      total,
      missingIds,
      missingNames: missingIds.map(labelFor),
      score,
    });
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matched !== a.matched) return b.matched - a.matched;
    const nameA = (a.dish.name || "").toLowerCase();
    const nameB = (b.dish.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return results;
}
