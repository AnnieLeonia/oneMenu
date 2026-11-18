import { compact, filter, flow, get, map, trim, toLower } from "lodash/fp";

import {
  FINDER_SEARCH_IGNORED_WORDS,
  formatFinderLabel,
  isFinderExcludedIngredient,
} from "./normalizeIngredient";
import {
  normalizedIngredientIdAssignedGroupId,
  collapsedGroupMatchesSearchQuery,
} from "./ingredientGroups";

export const FINDER_SEARCH_SELECTION_PREFIX = "search:";

const normalizeQuery = flow(String, trim, toLower);

export const makeFinderSearchSelectionId = (query) => {
  const q = normalizeQuery(query);
  return q ? `${FINDER_SEARCH_SELECTION_PREFIX}${q}` : null;
};

export const isFinderSearchSelectionId = (id) =>
  typeof id === "string" && id.startsWith(FINDER_SEARCH_SELECTION_PREFIX);

export const finderSearchSelectionQuery = (id) =>
  isFinderSearchSelectionId(id)
    ? id.slice(FINDER_SEARCH_SELECTION_PREFIX.length)
    : "";

const searchWords = (text) =>
  compact(String(text).split(/\s+/)).filter(
    (w) => !FINDER_SEARCH_IGNORED_WORDS.has(w)
  );

const MIN_QUERY_LENGTH = 1;
const MAX_QUERY_LONGER_THAN_LABEL = 3;

const includesMatch = (text, query) => {
  const haystack = String(text || "");
  if (!haystack || query.length < MIN_QUERY_LENGTH) return false;
  if (query.includes("färs") && haystack.startsWith("färsk")) return false;
  if (haystack.includes(query)) return true;
  return (
    haystack.length >= 4 &&
    query.startsWith(haystack) &&
    query.length - haystack.length <= MAX_QUERY_LONGER_THAN_LABEL
  );
};

export function ingredientLabelMatchesSearch(label, query) {
  const q = normalizeQuery(query);
  const words = searchWords(q);
  if (!q) return true;
  if (!words.length) return false;
  const text = formatFinderLabel(label);
  return [text, ...searchWords(text)].some((part) => includesMatch(part, q));
}

export function expandIngredientLabelVariantIds(selectedId, catalog) {
  if (!selectedId?.startsWith("raw:")) return selectedId ? [selectedId] : [];
  const selected = (catalog || []).find((ing) => ing.id === selectedId);
  if (!selected) return [selectedId];
  const stem = formatFinderLabel(selected.label);
  if (!stem) return [selectedId];
  const prefix = `${stem} `;
  const variants = flow(
    filter((ing) => {
      if (!ing.id.startsWith("raw:") || ing.id === selectedId) return false;
      const label = formatFinderLabel(ing.label);
      return label === stem || label.startsWith(prefix);
    }),
    map(get("id"))
  )(catalog);
  return [selectedId, ...variants];
}

const omitCollapsedMembersWhenGroupShown = (results) => {
  const groupIds = new Set(
    flow(
      filter((ing) => ing.isCollapsedGroup),
      map(get("id"))
    )(results)
  );
  if (!groupIds.size) return results;
  return filter(
    (ing) =>
      ing.isCollapsedGroup ||
      !ing.id?.startsWith("raw:") ||
      !groupIds.has(normalizedIngredientIdAssignedGroupId(ing.id))
  )(results);
};

const matchesLooseSearch = (ing, q) =>
  ingredientLabelMatchesSearch(ing.label, q) ||
  (ing.isCollapsedGroup && collapsedGroupMatchesSearchQuery(ing.id, q));

export function filterIngredientsByLooseSearch(ingredients, query) {
  const q = normalizeQuery(query);
  if (!q) return ingredients;
  if (!searchWords(q).length) return [];
  return flow(
    filter((ing) => !isFinderExcludedIngredient(ing.id)),
    filter((ing) => matchesLooseSearch(ing, q)),
    omitCollapsedMembersWhenGroupShown
  )(ingredients || []);
}
