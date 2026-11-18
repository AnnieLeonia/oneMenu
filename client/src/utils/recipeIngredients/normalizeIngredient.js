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
  return cleanIngredientName(name) || null;
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

/** Display text for the Find ingredient UI (always lowercase). */
export function formatFinderLabel(text) {
  if (text == null || text === "") return "";
  return String(text).toLocaleLowerCase("sv");
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

export function getIngredientCategory() {
  return "other";
}

const FINDER_EXCLUDED_SUBSTRINGS = [
  "salt",
  "peppar",
  "olja",
  "smör",
  "vatten",
  "mjöl",
  "mjölk",
  "ris",
  "vinäger",
  "socker",
  "soja",
  "pasta",
  "vodka",
  "gin",
];

/** Hide pantry staples from the Find ingredient picker. */
export function isFinderExcludedIngredient(ingredientId) {
  const cleaned = getIngredientLabel(ingredientId);
  return (
    !!cleaned &&
    (FINDER_EXCLUDED_SUBSTRINGS.some((part) => cleaned.includes(part)) ||
      /\bis\b/.test(cleaned))
  );
}
