export function compareFinderCatalogEntries(a, b) {
  if (a.recipeCount !== b.recipeCount) {
    return b.recipeCount - a.recipeCount;
  }
  return a.label.localeCompare(b.label, "sv", { sensitivity: "base" });
}

export function sortFinderCatalogEntries(items) {
  return [...(items || [])].sort(compareFinderCatalogEntries);
}
