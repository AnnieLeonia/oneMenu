/**
 * Groups consecutive items with the same key (stable document order).
 * @template T
 * @param {T[]} items
 * @param {(item: T) => unknown} getKey
 * @returns {{ key: unknown, items: T[] }[]}
 */
export function groupConsecutiveBy(items, getKey) {
  /** @type {{ key: unknown, items: T[] }[]} */
  const groups = [];

  for (const item of items) {
    const key = getKey(item);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, items: [item] });
    }
  }

  return groups;
}
