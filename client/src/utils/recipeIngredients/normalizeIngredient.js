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

/** é→e so filé / file spellings match the same substring. */
export function foldIngredientAccents(text) {
  if (!text) return "";
  return String(text).replace(/é/g, "e");
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
