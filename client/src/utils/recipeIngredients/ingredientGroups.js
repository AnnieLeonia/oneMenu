import { cleanIngredientName, getIngredientLabel } from "./normalizeIngredient";

function isFarsName(cleaned) {
  if (!cleaned || /\bfärsk/.test(cleaned)) return false;
  return cleaned.includes("färs");
}

function collapsedGroup(slug, label, match) {
  const matchesCleaned =
    typeof match === "function" ? match : (t) => t.includes(match);
  return {
    id: `group:${slug}`,
    label,
    collapseToSingle: true,
    matchesCleaned,
  };
}

/** First matching entry wins (e.g. buljong before kycklingfilé). */
export const INGREDIENT_GROUP_DEFS = [
  collapsedGroup("färs", "Färs", isFarsName),
  collapsedGroup("fläskfile", "Fläskfile", "fläskfil"),
  collapsedGroup("buljong", "Buljong", "buljong"),
  collapsedGroup("fond", "Fond", "fond"),
  collapsedGroup("kycklingfilé", "Kycklingfilé", "kycklingfil"),
  collapsedGroup("bacon", "Bacon", "bacon"),
  collapsedGroup("vitlök", "Vitlök", "vitlök"),
  collapsedGroup("parmesan", "Parmesan", "parmesan"),
  collapsedGroup("sallad", "Sallad", "sallad"),
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
  const def = INGREDIENT_GROUP_DEFS.find((d) => d.matchesCleaned(cleaned));
  return def?.id ?? null;
}

export function getAssignedGroupDef(canonicalId) {
  const groupId = canonicalIdAssignedGroupId(canonicalId);
  return groupId ? getIngredientGroupDef(groupId) : null;
}

export function groupMatchesCanonicalId(groupDef, canonicalId) {
  if (!groupDef || !canonicalId?.startsWith("raw:")) return false;
  return canonicalIdAssignedGroupId(canonicalId) === groupDef.id;
}

export function isIngredientCoveredByGroups(canonicalId) {
  return getAssignedGroupDef(canonicalId) != null;
}

export function belongsToCollapsedGroup(canonicalId) {
  return Boolean(getAssignedGroupDef(canonicalId)?.collapseToSingle);
}

/** e.g. köttfärs search → färs chip */
export function collapsedGroupMatchesSearchQuery(groupId, query) {
  const def = getIngredientGroupDef(groupId);
  if (!def?.collapseToSingle) return false;
  const cleaned = cleanIngredientName(query);
  return !!cleaned && def.matchesCleaned(cleaned);
}
