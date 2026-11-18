import {
  compact,
  isArray,
  map,
  pipe,
  size,
  trim,
  toString as toStr,
} from "lodash/fp";

function parseFrontmatterItem(item) {
  if (!item) return null;
  if (typeof item === "string") {
    const name = trim(item);
    return name ? { name } : null;
  }
  if (typeof item !== "object" || !item.name) return null;
  const name = trim(toStr(item.name));
  if (!name) return null;
  const entry = { name };
  if (item.quantity != null && item.quantity !== "") {
    entry.quantity = item.quantity;
  }
  const unit = item.unit != null ? trim(toStr(item.unit)) : "";
  if (unit) entry.unit = unit;
  const group = item.group != null ? trim(toStr(item.group)) : "";
  if (group) entry.group = group;
  return entry;
}

/**
 * Read structured ingredients from frontmatter data.
 * @param {object} data
 * @returns {Array<{ name: string, quantity?: *, unit?: string, group?: string }>|null}
 */
export function parseIngredientsFromFrontmatter(data) {
  const raw = data?.ingredients;
  if (!isArray(raw) || !size(raw)) return null;
  const ingredients = pipe(map(parseFrontmatterItem), compact)(raw);
  return size(ingredients) ? ingredients : null;
}
