import { compact, isArray, map, size, trim, toString } from "lodash/fp";

function parseFrontmatterItem(item) {
  const name =
    typeof item === "string"
      ? trim(item)
      : item?.name
      ? trim(toString(item.name))
      : "";
  if (!name) return null;
  if (typeof item !== "object" || item == null) return { name };
  const entry = { name };
  if (item.quantity != null && item.quantity !== "") {
    entry.quantity = item.quantity;
  }
  for (const key of ["unit", "group"]) {
    const v = trim(toString(item[key] ?? ""));
    if (v) entry[key] = v;
  }
  return entry;
}

export function parseFromFrontmatter(data) {
  const raw = data?.ingredients;
  if (!isArray(raw) || !size(raw)) return null;
  const ingredients = compact(map(parseFrontmatterItem)(raw));
  return size(ingredients) ? ingredients : null;
}
