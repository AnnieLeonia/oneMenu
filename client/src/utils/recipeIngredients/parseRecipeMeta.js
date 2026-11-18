const DIFFICULTY_HEADER = /^(svårighetsgrad|difficulty|svårighet)$/i;
const TIME_HEADER = /^(tid|time|duration)$/i;

function splitRow(line) {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function isSeparator(line) {
  return /^[\s|:-]+$/.test((line || "").trim());
}

/**
 * @param {string} markdown
 * @returns {{ difficulty?: string, time?: string }|null}
 */
export function extractMetaTable(markdown) {
  if (!markdown) return null;
  const lines = markdown.split(/\r?\n/);

  for (let i = 0; i < lines.length - 1; i += 1) {
    const headerLine = lines[i];
    if (!headerLine || !headerLine.includes("|")) continue;

    const headers = splitRow(headerLine).map((h) => h.toLowerCase());
    const difficultyCol = headers.findIndex((h) => DIFFICULTY_HEADER.test(h));
    const timeCol = headers.findIndex((h) => TIME_HEADER.test(h));
    if (difficultyCol < 0 && timeCol < 0) continue;

    let dataIndex = i + 1;
    if (dataIndex < lines.length && isSeparator(lines[dataIndex])) {
      dataIndex += 1;
    }
    if (dataIndex >= lines.length || !lines[dataIndex].includes("|")) {
      continue;
    }

    const cells = splitRow(lines[dataIndex]);
    const result = {};
    if (difficultyCol >= 0 && cells[difficultyCol]) {
      result.difficulty = cells[difficultyCol];
    }
    if (timeCol >= 0 && cells[timeCol]) {
      result.time = cells[timeCol];
    }
    return Object.keys(result).length ? result : null;
  }

  return null;
}

/**
 * @param {string} markdown
 * @returns {string}
 */
export function removeMetaTable(markdown) {
  if (!markdown) return "";
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    if (
      i < lines.length - 1 &&
      lines[i].includes("|") &&
      splitRow(lines[i]).some((h) => DIFFICULTY_HEADER.test(h.toLowerCase())) &&
      splitRow(lines[i]).some((h) => TIME_HEADER.test(h.toLowerCase()))
    ) {
      i += 1;
      if (i < lines.length && isSeparator(lines[i])) i += 1;
      if (i < lines.length && lines[i].includes("|")) i += 1;
      while (i < lines.length && !lines[i].trim()) i += 1;
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * @param {{ difficulty?: string, time?: string }} meta
 * @returns {string}
 */
export function formatMetaTable(meta) {
  if (!meta) return "";
  const difficulty = meta.difficulty ? String(meta.difficulty).trim() : "";
  const time = meta.time ? String(meta.time).trim() : "";
  if (!difficulty && !time) return "";

  return [
    "Svårighetsgrad   | Tid",
    "---------------- | -------------",
    `${difficulty || "—"} | ${time || "—"}`,
  ].join("\n");
}
