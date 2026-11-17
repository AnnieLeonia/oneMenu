/**
 * Prepare a raw ingredient name for stable id lookup.
 * @param {string} name
 * @returns {string}
 */
export function cleanIngredientName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/&nbsp;/gi, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-zåäöéüñ0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalized text for an ingredient name (no canonical catalog).
 * @param {string} name
 * @returns {string|null}
 */
export function normalizeIngredient(name) {
  const cleaned = cleanIngredientName(name);
  return cleaned || null;
}

/**
 * Stable id for matching from recipe text.
 * @param {string} name
 * @returns {string|null}
 */
export function getIngredientId(name) {
  const cleaned = cleanIngredientName(name);
  if (!cleaned) return null;
  return `raw:${cleaned}`;
}

/**
 * @param {string} ingredientId
 * @returns {string}
 */
export function getIngredientLabel(ingredientId) {
  if (!ingredientId) return "";
  if (ingredientId.startsWith("raw:")) {
    return ingredientId.slice(4);
  }
  return ingredientId;
}

/**
 * @param {string} ingredientId
 * @returns {string}
 */
export function getIngredientCategory() {
  return "other";
}
