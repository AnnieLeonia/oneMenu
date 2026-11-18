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
      if (typeof item !== "object" || !item.name) return null;
      const name = String(item.name).trim();
      if (!name) return null;
      return {
        name,
        ...(item.quantity != null && item.quantity !== ""
          ? { quantity: item.quantity }
          : null),
        ...(item.unit != null && String(item.unit).trim()
          ? { unit: String(item.unit).trim() }
          : null),
        ...(item.group != null && String(item.group).trim()
          ? { group: String(item.group).trim() }
          : null),
      };
    })
    .filter(Boolean);

  return ingredients.length > 0 ? ingredients : null;
}
