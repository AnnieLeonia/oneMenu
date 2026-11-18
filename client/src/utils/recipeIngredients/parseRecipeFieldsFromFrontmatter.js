/**
 * @param {object} data
 * @returns {string}
 */
export function getRecipeDifficulty(data) {
  if (!data || data.difficulty == null) return "";
  return String(data.difficulty).trim();
}

/**
 * @param {object} data
 * @returns {string}
 */
export function getRecipeTime(data) {
  if (!data || data.time == null) return "";
  return String(data.time).trim();
}

/**
 * Steps as inline-markdown list items, or one markdown block (`|` in YAML).
 * @param {object} data
 * @returns {string|string[]|null}
 */
export function parseStepsFromFrontmatter(data) {
  if (!data || data.steps == null) return null;

  if (typeof data.steps === "string") {
    const text = data.steps.trim();
    return text || null;
  }

  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    return null;
  }

  const steps = data.steps
    .map((item) => {
      if (item == null) return "";
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item.text != null) {
        return String(item.text).trim();
      }
      return "";
    })
    .filter(Boolean);

  return steps.length > 0 ? steps : null;
}
