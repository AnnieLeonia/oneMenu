/**
 * Format structured ingredients as a markdown ## Ingredienser section (GFM table).
 * @param {Array<{ name: string, quantity?: *, unit?: string, group?: string }>} ingredients
 * @param {{ heading?: string }} [options]
 * @returns {string}
 */
export function formatIngredientsSection(ingredients, options = {}) {
  const heading = options.heading || "## Ingredienser";
  if (!ingredients || ingredients.length === 0) {
    return "";
  }

  const allGrouped = ingredients.every(
    (item) => item.group && String(item.group).trim()
  );

  const lines = [heading];
  if (!allGrouped) {
    lines.push("Mängd | Ingrediens", "----- | ----------");
  }

  let currentGroup = null;
  ingredients.forEach((item) => {
    const group = item.group ? String(item.group).trim() : null;
    if (group && group !== currentGroup) {
      const isFirstGroup = currentGroup == null;
      currentGroup = group;
      if (!isFirstGroup || !allGrouped) {
        lines.push("");
      }
      lines.push(`### ${group}`);
      lines.push("Mängd | Ingrediens", "----- | ----------");
    }

    const amount = formatAmountCell(item);
    const name = String(item.name || "").trim();
    if (!name) return;
    lines.push(`${amount} | ${name}`);
  });

  return `${lines.join("\n")}\n`;
}

function formatAmountCell(item) {
  const quantity = item.quantity;
  const unit = item.unit ? String(item.unit).trim() : "";

  if (quantity == null || quantity === "") {
    return unit ? unit : "&nbsp;";
  }

  const qtyText =
    typeof quantity === "number" && quantity === 0.5 ? "1/2" : String(quantity);

  return unit ? `${qtyText} ${unit}` : qtyText;
}

const NEXT_RECIPE_SECTION =
  /^##\s+(Tillagning|Instructions|Method|Directions|Tillberedning)\b/im;

/**
 * Insert an ingredients section before Tillagning (or append if none).
 * @param {string} markdownBody
 * @param {string} sectionMarkdown
 * @returns {string}
 */
export function insertIngredientsSection(markdownBody, sectionMarkdown) {
  if (!sectionMarkdown || !sectionMarkdown.trim()) {
    return markdownBody || "";
  }

  const body = (markdownBody || "").trim();
  if (!body) {
    return sectionMarkdown.trim();
  }

  const match = NEXT_RECIPE_SECTION.exec(body);
  if (match) {
    const before = body.slice(0, match.index).trimEnd();
    const after = body.slice(match.index).trimStart();
    const gap = before ? "\n\n" : "";
    return `${before}${gap}${sectionMarkdown.trim()}\n\n${after}`;
  }

  return `${body}\n\n${sectionMarkdown.trim()}`;
}
