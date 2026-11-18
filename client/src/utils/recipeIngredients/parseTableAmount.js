/**
 * Parse a quantity cell from an Ingredienser table (e.g. "600 g", "1/2 dl", "&nbsp;").
 * @param {string} raw
 * @returns {{ quantity?: string|number, unit?: string }}
 */
export function parseTableAmount(raw) {
  if (!raw || typeof raw !== "string") {
    return {};
  }

  const cleaned = raw
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned === "-" || cleaned === "—") {
    return {};
  }

  const rangeMatch = cleaned.match(
    /^(?:ca\.?\s+|cirka\s+)?(\d+\s*-\s*\d+)\s+(.*)$/i
  );
  if (rangeMatch) {
    const unit = (rangeMatch[2] || "").trim();
    const result = { quantity: rangeMatch[1].replace(/\s+/g, "") };
    if (unit) {
      result.unit = unit;
    }
    return result;
  }

  const match = cleaned.match(
    /^(?:ca\.?\s+|cirka\s+)?(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*(.*)$/i
  );
  if (!match) {
    return {};
  }

  const quantityRaw = match[1].replace(/\s+/g, "");
  const unit = (match[2] || "").trim();

  let quantity = quantityRaw;
  if (!quantityRaw.includes("/")) {
    const numeric = parseFloat(quantityRaw.replace(",", "."));
    if (!Number.isNaN(numeric)) {
      quantity = numeric;
    }
  }

  const result = { quantity };
  if (unit) {
    result.unit = unit;
  }
  return result;
}
