/**
 * @param {object} data
 * @returns {string}
 */
export function getRecipeTitle(data) {
  if (!data || data.title == null) return "";
  return String(data.title).trim();
}

/**
 * Short recipe blurb (YAML key `description`).
 * @param {object} data
 * @returns {string}
 */
export function getRecipeSummary(data) {
  if (!data) return "";
  const value = data.description != null ? data.description : data.summary;
  if (value == null) return "";
  return String(value).trim();
}

export function hasStructuredRecipeMeta(data) {
  if (!data || typeof data !== "object") return false;
  if (getRecipeTitle(data) || getRecipeSummary(data)) return true;
  if (data.difficulty || data.time) return true;
  if (Array.isArray(data.ingredients) && data.ingredients.length > 0)
    return true;
  if (Array.isArray(data.steps) && data.steps.length > 0) return true;
  if (typeof data.steps === "string" && data.steps.trim()) return true;
  return false;
}
