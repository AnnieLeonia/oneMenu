import { deburr, find, upperFirst } from "lodash/fp";

import { cleanIngredientName, getIngredientLabel } from "./normalize";

const fold = (text) => deburr(String(text || ""));

const collapsedGroup = (slug) => {
  const needle = fold(slug);
  return {
    id: `group:${slug}`,
    label: upperFirst(slug),
    matchesCleaned: (t) => fold(t).includes(needle),
  };
};

/** First matching entry wins (e.g. buljong before kycklingfile). */
export const INGREDIENT_GROUP_DEFS = [
  "färs",
  "fläskfile",
  "buljong",
  "fond",
  "kycklingfile",
  "bacon",
  "vitlök",
  "parmesan",
  "sallad",
].map(collapsedGroup);

export function groupIdFor(normalizedIngredientId) {
  if (!normalizedIngredientId?.startsWith("raw:")) return null;
  const cleaned = getIngredientLabel(normalizedIngredientId);
  if (!cleaned) return null;
  return (
    find((d) => d.matchesCleaned(cleaned))(INGREDIENT_GROUP_DEFS)?.id ?? null
  );
}

export function groupMatchesQuery(groupId, query) {
  const def = find((d) => d.id === groupId)(INGREDIENT_GROUP_DEFS);
  const cleaned = cleanIngredientName(query);
  return !!def && !!cleaned && def.matchesCleaned(cleaned);
}
