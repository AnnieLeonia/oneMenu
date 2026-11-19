import { compact, isArray, map, size, trim, toString } from "lodash/fp";

import { parseFrontMatter } from "../../components/markdown/parseFrontMatter";

function parseFrontmatterItem(item) {
  const name = trim(
    typeof item === "string" ? item : toString(item?.name ?? "")
  );
  if (!name) return null;
  if (typeof item !== "object" || item == null) return { name };
  const entry = { name };
  if (item.quantity != null && item.quantity !== "")
    entry.quantity = item.quantity;
  for (const key of ["unit", "group"]) {
    const v = trim(toString(item[key] ?? ""));
    if (v) entry[key] = v;
  }
  return entry;
}

export function parseIngredientItems(raw) {
  if (!isArray(raw) || !size(raw)) return null;
  const ingredients = compact(map(parseFrontmatterItem)(raw));
  return size(ingredients) ? ingredients : null;
}

export const parseDishIngredients = (description) =>
  parseIngredientItems(parseFrontMatter(description).data?.ingredients);
