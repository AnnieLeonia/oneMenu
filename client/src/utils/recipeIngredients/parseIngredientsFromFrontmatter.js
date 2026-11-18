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
  if (typeof item === "string") {
    const name = trim(item);
    return name ? { name } : null;
  }
  if (!item || typeof item !== "object" || !item.name) return null;
  const name = trim(toStr(item.name));
  if (!name) return null;
  const entry = { name };
  if (item.quantity != null && item.quantity !== "") {
    entry.quantity = item.quantity;
  }
  for (const key of ["unit", "group"]) {
    const v = trim(toStr(item[key] ?? ""));
    if (v) entry[key] = v;
  }
  return entry;
}

/** @param {object} data @returns {Array<{ name: string, quantity?: *, unit?: string, group?: string }>|null} */
export function parseIngredientsFromFrontmatter(data) {
  const raw = data?.ingredients;
  if (!isArray(raw) || !size(raw)) return null;
  const ingredients = pipe(map(parseFrontmatterItem), compact)(raw);
  return size(ingredients) ? ingredients : null;
}
