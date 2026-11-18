/**
 * Read structured ingredients from frontmatter data.
 * @param {object} data
 * @returns {Array<{ name: string, quantity?: *, unit?: string, group?: string }>|null}
 */
export function parseIngredientsFromFrontmatter(data) {
  if (
    !data ||
    !Array.isArray(data.ingredients) ||
    data.ingredients.length === 0
  ) {
    return null;
  }

  const ingredients = data.ingredients
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { name } : null;
      }
      if (typeof item === "object" && item.name) {
        const name = String(item.name).trim();
        if (!name) return null;
        const result = { name };
        if (item.quantity != null && item.quantity !== "") {
          result.quantity = item.quantity;
        }
        if (item.unit != null && String(item.unit).trim()) {
          result.unit = String(item.unit).trim();
        }
        if (item.group != null && String(item.group).trim()) {
          result.group = String(item.group).trim();
        }
        return result;
      }
      return null;
    })
    .filter(Boolean);

  return ingredients.length > 0 ? ingredients : null;
}
