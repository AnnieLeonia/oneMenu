import { deburr, find, upperFirst } from "lodash/fp";

import { cleanIngredientName, getIngredientLabel } from "./normalizeIngredient";

const foldAccents = (text) => (text ? deburr(String(text)) : "");

function collapsedGroup(slug) {
  const needle = foldAccents(slug);
  return {
    id: `group:${slug}`,
    label: upperFirst(slug),
    matchesCleaned: (t) => foldAccents(t).includes(needle),
  };
}

/** First matching entry wins (e.g. buljong before kycklingfile). */
const INGREDIENT_GROUP_SLUGS = [
  "färs",
  "fläskfile",
  "buljong",
  "fond",
  "kycklingfile",
  "bacon",
  "vitlök",
  "parmesan",
  "sallad",
];

export const INGREDIENT_GROUP_DEFS = INGREDIENT_GROUP_SLUGS.map(collapsedGroup);

export function getIngredientGroupDef(groupId) {
  return find((d) => d.id === groupId)(INGREDIENT_GROUP_DEFS) || null;
}

/** @param {string} canonicalId @returns {string|null} */
export function canonicalIdAssignedGroupId(canonicalId) {
  if (!canonicalId?.startsWith("raw:")) return null;
  const cleaned = getIngredientLabel(canonicalId);
  if (!cleaned) return null;
  const def = find((d) => d.matchesCleaned(cleaned))(INGREDIENT_GROUP_DEFS);
  return def?.id ?? null;
}

export const groupMatchesCanonicalId = (groupDef, canonicalId) =>
  Boolean(groupDef) && canonicalIdAssignedGroupId(canonicalId) === groupDef.id;

/** e.g. köttfärs search → färs chip */
export function collapsedGroupMatchesSearchQuery(groupId, query) {
  const def = getIngredientGroupDef(groupId);
  if (!def) return false;
  const cleaned = cleanIngredientName(query);
  return !!cleaned && def.matchesCleaned(cleaned);
}
