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
  const name =
    typeof item === "string"
      ? trim(item)
      : item?.name
      ? trim(toStr(item.name))
      : "";
  if (!name) return null;
  if (typeof item !== "object" || item == null) return { name };
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
export function parseFromFrontmatter(data) {
  const raw = data?.ingredients;
  if (!isArray(raw) || !size(raw)) return null;
  const ingredients = pipe(map(parseFrontmatterItem), compact)(raw);
  return size(ingredients) ? ingredients : null;
}
