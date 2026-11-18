import { compact, flow, trim, toLower } from "lodash/fp";

import { formatFinderLabel } from "./normalizeIngredient";
import {
  canonicalIdAssignedGroupId,
  collapsedGroupMatchesSearchQuery,
} from "./ingredientGroups";

export const FINDER_SEARCH_SELECTION_PREFIX = "search:";

const normalizeQuery = flow((q) => String(q || ""), trim, toLower);

export function makeFinderSearchSelectionId(query) {
  const q = normalizeQuery(query);
  if (!q) return null;
  return `${FINDER_SEARCH_SELECTION_PREFIX}${q}`;
}

export function isFinderSearchSelectionId(id) {
  return (
    typeof id === "string" && id.startsWith(FINDER_SEARCH_SELECTION_PREFIX)
  );
}

export function finderSearchSelectionQuery(id) {
  if (!isFinderSearchSelectionId(id)) return "";
  return id.slice(FINDER_SEARCH_SELECTION_PREFIX.length);
}

/** Modifiers like "färsk" are not meaningful Find search terms on their own. */
const FINDER_SEARCH_IGNORED_WORDS = new Set(["färsk"]);

function searchableQueryWords(q) {
  return compact(String(q).split(/\s+/)).filter(
    (w) => !FINDER_SEARCH_IGNORED_WORDS.has(w)
  );
}

function labelWordsForSearch(text) {
  return compact(formatFinderLabel(text).split(/\s+/)).filter(
    (w) => !FINDER_SEARCH_IGNORED_WORDS.has(w)
  );
}

/** "färs" must not match the separate staple word "färsk…". */
function isFarsFreshFalsePositive(word, query) {
  return query.includes("färs") && word.startsWith("färsk");
}

/** Short suffix only (tomat → tomater), not kyckling → kycklingfilé. */
const MAX_QUERY_LONGER_THAN_WORD = 3;

function wordMatchesQuery(word, query) {
  if (!word || !query) return false;
  if (isFarsFreshFalsePositive(word, query)) return false;
  if (word === query) return true;
  if (word.startsWith(query)) return true;
  if (
    word.length >= 4 &&
    query.startsWith(word) &&
    query.length - word.length <= MAX_QUERY_LONGER_THAN_WORD
  ) {
    return true;
  }
  if (query.length >= 3 && word.endsWith(query)) return true;
  return false;
}

/**
 * Loose match: any word in the ingredient name vs the search string.
 * @param {string} label
 * @param {string} query lowercased, trimmed
 */
export function ingredientLabelMatchesSearch(label, query) {
  const q = normalizeQuery(query);
  if (!q) return true;
  if (!searchableQueryWords(q).length) return false;
  const text = formatFinderLabel(label);
  if (q.includes(" ") && text.includes(q)) return true;
  return labelWordsForSearch(label).some((word) => wordMatchesQuery(word, q));
}

/** Same naming family: exact match or "laxfilé …" detail lines. */
export function expandIngredientLabelVariantIds(selectedId, catalog) {
  if (!selectedId?.startsWith("raw:")) return selectedId ? [selectedId] : [];
  const selected = (catalog || []).find((ing) => ing.id === selectedId);
  if (!selected) return [selectedId];
  const stem = formatFinderLabel(selected.label);
  if (!stem) return [selectedId];
  const prefix = `${stem} `;
  const variants = (catalog || [])
    .filter((ing) => {
      if (!ing.id.startsWith("raw:") || ing.id === selectedId) return false;
      const text = formatFinderLabel(ing.label);
      return text === stem || text.startsWith(prefix);
    })
    .map((ing) => ing.id);
  return [selectedId, ...variants];
}

function omitCollapsedMembersWhenGroupShown(results) {
  const groupIds = new Set(
    results.filter((ing) => ing.isCollapsedGroup).map((ing) => ing.id)
  );
  if (!groupIds.size) return results;
  return results.filter((ing) => {
    if (ing.isCollapsedGroup || !ing.id?.startsWith("raw:")) return true;
    const groupId = canonicalIdAssignedGroupId(ing.id);
    return !groupId || !groupIds.has(groupId);
  });
}

export function filterIngredientsByLooseSearch(ingredients, query) {
  const q = normalizeQuery(query);
  if (!q) return ingredients;
  if (!searchableQueryWords(q).length) return [];
  return omitCollapsedMembersWhenGroupShown(
    (ingredients || []).filter(
      (ing) =>
        ingredientLabelMatchesSearch(ing.label, q) ||
        (ing.isCollapsedGroup && collapsedGroupMatchesSearchQuery(ing.id, q))
    )
  );
}
