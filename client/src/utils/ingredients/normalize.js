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
 * Stable id for matching from recipe text.
 * @param {string} name
 * @returns {string|null}
 */
export function getIngredientId(name) {
  const cleaned = cleanIngredientName(name);
  if (!cleaned) return null;
  return `raw:${cleaned}`;
}

export const formatLabel = (text) =>
  text == null || text === "" ? "" : String(text).toLocaleLowerCase("sv");

/**
 * @param {string} ingredientId
 * @returns {string}
 */
export const getIngredientLabel = (ingredientId) =>
  ingredientId?.startsWith("raw:") ? ingredientId.slice(4) : ingredientId || "";

const STAPLE_WORDS = ["färsk", "salt", "peppar", "olja", "smör", "vatten"];

/** Whole words that must not be used as Find search terms on their own. */
export const SEARCH_STOP_WORDS = new Set(STAPLE_WORDS);

const EXCLUDED_SUBSTRINGS = [
  ...STAPLE_WORDS.filter((w) => w !== "färsk"),
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
export function isExcludedFromPicker(ingredientId) {
  const cleaned = getIngredientLabel(ingredientId);
  if (!cleaned) return false;
  return (
    EXCLUDED_SUBSTRINGS.some((part) => cleaned.includes(part)) ||
    /\bis\b/.test(cleaned)
  );
}
