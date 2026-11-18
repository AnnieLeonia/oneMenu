export function sortFinderCatalogEntries(items) {
  return [...(items || [])].sort((a, b) =>
    a.recipeCount !== b.recipeCount
      ? b.recipeCount - a.recipeCount
      : a.label.localeCompare(b.label, "sv", { sensitivity: "base" })
  );
}
