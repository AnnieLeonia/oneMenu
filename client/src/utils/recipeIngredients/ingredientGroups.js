import { find } from "lodash/fp";

import {
  cleanIngredientName,
  foldIngredientAccents,
  getIngredientLabel,
} from "./normalizeIngredient";

function isFarsName(cleaned) {
  if (!cleaned || /\bfärsk/.test(cleaned)) return false;
  return cleaned.includes("färs");
}

function collapsedGroup(slug, match = slug) {
  const label = slug.charAt(0).toUpperCase() + slug.slice(1);
  const matchesCleaned =
    typeof match === "function"
      ? match
      : (t) => foldIngredientAccents(t).includes(foldIngredientAccents(match));
  return {
    id: `group:${slug}`,
    label,
    collapseToSingle: true,
    matchesCleaned,
  };
}

/** First matching entry wins (e.g. buljong before kycklingfile). */
export const INGREDIENT_GROUP_DEFS = [
  collapsedGroup("färs", isFarsName),
  collapsedGroup("fläskfile"),
  collapsedGroup("buljong"),
  collapsedGroup("fond"),
  collapsedGroup("kycklingfile"),
  collapsedGroup("bacon"),
  collapsedGroup("vitlök"),
  collapsedGroup("parmesan"),
  collapsedGroup("sallad"),
];

const GROUP_BY_ID = new Map(INGREDIENT_GROUP_DEFS.map((def) => [def.id, def]));

export function getIngredientGroupDef(groupId) {
  return GROUP_BY_ID.get(groupId) || null;
}

/** @param {string} canonicalId @returns {string|null} */
export function canonicalIdAssignedGroupId(canonicalId) {
  if (!canonicalId?.startsWith("raw:")) return null;
  const cleaned = getIngredientLabel(canonicalId);
  if (!cleaned) return null;
  const def = find((d) => d.matchesCleaned(cleaned))(INGREDIENT_GROUP_DEFS);
  return def?.id ?? null;
}

export function groupMatchesCanonicalId(groupDef, canonicalId) {
  return (
    Boolean(groupDef) && canonicalIdAssignedGroupId(canonicalId) === groupDef.id
  );
}

export function isIngredientCoveredByGroups(canonicalId) {
  return canonicalIdAssignedGroupId(canonicalId) != null;
}

/** e.g. köttfärs search → färs chip */
export function collapsedGroupMatchesSearchQuery(groupId, query) {
  const def = getIngredientGroupDef(groupId);
  if (!def?.collapseToSingle) return false;
  const cleaned = cleanIngredientName(query);
  return !!cleaned && def.matchesCleaned(cleaned);
}
