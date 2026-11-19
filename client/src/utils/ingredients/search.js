import {
  compact,
  filter,
  flow,
  get,
  map,
  reject,
  trim,
  toLower,
} from "lodash/fp";

import {
  SEARCH_STOP_WORDS,
  formatLabel,
  isExcludedFromPicker,
} from "./normalize";
import { groupIdFor, groupMatchesQuery } from "./groups";

export const SEARCH_CHIP_PREFIX = "search:";

const normalizeQuery = flow(String, trim, toLower);

export const makeSearchChipId = (query) => {
  const q = normalizeQuery(query);
  return q ? `${SEARCH_CHIP_PREFIX}${q}` : null;
};

export const isSearchChipId = (id) =>
  typeof id === "string" && id.startsWith(SEARCH_CHIP_PREFIX);

export const searchChipQuery = (id) =>
  isSearchChipId(id) ? id.slice(SEARCH_CHIP_PREFIX.length) : "";

const searchWords = (text) =>
  compact(String(text).split(/\s+/)).filter((w) => !SEARCH_STOP_WORDS.has(w));

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

export function labelMatchesSearch(label, query) {
  const q = normalizeQuery(query);
  const words = searchWords(q);
  if (!q) return true;
  if (!words.length) return false;
  const text = formatLabel(label);
  return [text, ...searchWords(text)].some((part) => includesMatch(part, q));
}

export function expandLabelVariants(selectedId, catalog) {
  if (!selectedId?.startsWith("raw:")) return selectedId ? [selectedId] : [];
  const selected = (catalog || []).find((ing) => ing.id === selectedId);
  if (!selected) return [selectedId];
  const stem = formatLabel(selected.label);
  if (!stem) return [selectedId];
  const prefix = `${stem} `;
  const variants = flow(
    filter((ing) => {
      if (!ing.id.startsWith("raw:") || ing.id === selectedId) return false;
      const label = formatLabel(ing.label);
      return label === stem || label.startsWith(prefix);
    }),
    map(get("id"))
  )(catalog);
  return [selectedId, ...variants];
}

const omitCollapsedMembersWhenGroupShown = (results) => {
  const groupIds = new Set(
    flow(filter(get("isCollapsedGroup")), map(get("id")))(results)
  );
  if (!groupIds.size) return results;
  return reject(
    (ing) =>
      !ing.isCollapsedGroup &&
      ing.id?.startsWith("raw:") &&
      groupIds.has(groupIdFor(ing.id))
  )(results);
};

export function filterBySearch(ingredients, query) {
  const q = normalizeQuery(query);
  if (!q) return ingredients;
  if (!searchWords(q).length) return [];
  return flow(
    filter((ing) => !isExcludedFromPicker(ing.id)),
    filter(
      (ing) =>
        labelMatchesSearch(ing.label, q) ||
        (ing.isCollapsedGroup && groupMatchesQuery(ing.id, q))
    ),
    omitCollapsedMembersWhenGroupShown
  )(ingredients || []);
}
