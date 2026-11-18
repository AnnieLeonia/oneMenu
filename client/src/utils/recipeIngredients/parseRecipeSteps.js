const STEPS_START =
  /^##\s+(Tillagning|Instructions|Method|Directions|Tillberedning|Gör så här|Instruktioner)\b[^\n]*(?:\r?\n|$)/im;
const LEVEL2_HEADING = /^##\s+[^#]/m;
const STEP_LINE = /^(?:\d+[.)]\s+|[-*+]\s+)(.+)$/;

/**
 * @param {string} section
 * @returns {string[]|null}
 */
export function parseStepsFromText(section) {
  if (!section || !section.trim()) return null;
  const steps = [];
  section.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const match = STEP_LINE.exec(line);
    if (match) {
      steps.push(match[1].trim());
      return;
    }
    if (!/^#/.test(line)) {
      steps.push(line);
    }
  });
  return steps.length > 0 ? steps : null;
}

function sliceStepsSection(markdown) {
  if (!markdown) return null;
  const startMatch = STEPS_START.exec(markdown);
  if (!startMatch) return null;

  const afterStart = markdown.slice(startMatch.index + startMatch[0].length);
  const endMatch = LEVEL2_HEADING.exec(afterStart);
  return endMatch ? afterStart.slice(0, endMatch.index) : afterStart;
}

/**
 * Raw Tillagning body (markdown preserved) for YAML `steps` string.
 * @param {string} markdown
 * @returns {string|null}
 */
export function extractStepsSectionRaw(markdown) {
  const section = sliceStepsSection(markdown);
  if (!section) return null;
  const text = section.trim();
  return text || null;
}

/**
 * @param {string} markdown
 * @returns {string[]|null}
 */
export function extractStepsSection(markdown) {
  const section = sliceStepsSection(markdown);
  if (!section) return null;
  return parseStepsFromText(section);
}

export function hasStepsValue(steps) {
  if (steps == null) return false;
  if (typeof steps === "string") return !!steps.trim();
  if (Array.isArray(steps)) return steps.length > 0;
  return false;
}

export function normalizeStepsForCompare(steps) {
  if (steps == null) return "";
  if (typeof steps === "string") return steps.trim();
  if (Array.isArray(steps)) return JSON.stringify(steps);
  return "";
}

/**
 * @param {string} markdown
 * @returns {string}
 */
export function removeStepsSection(markdown) {
  if (!markdown) return "";
  const startMatch = STEPS_START.exec(markdown);
  if (!startMatch) return markdown;

  const before = markdown.slice(0, startMatch.index);
  const afterStart = markdown.slice(startMatch.index + startMatch[0].length);
  const endMatch = LEVEL2_HEADING.exec(afterStart);
  const after = endMatch ? afterStart.slice(endMatch.index) : "";

  return `${before}${after}`.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * @param {string|string[]|null|undefined} steps
 * @param {{ heading?: string }} [options]
 * @returns {string}
 */
export function formatStepsSection(steps, options = {}) {
  if (!hasStepsValue(steps)) return "";
  const heading = options.heading || "## Tillagning";

  if (typeof steps === "string") {
    const body = steps.trim();
    if (
      /^##\s+(Tillagning|Instructions|Method|Directions|Tillberedning)\b/im.test(
        body
      )
    ) {
      return `${body}\n`;
    }
    return `${heading}\n\n${body}\n`;
  }

  const lines = [heading];
  steps.forEach((step, index) => {
    const text = String(step || "").trim();
    if (!text) return;
    lines.push(`${index + 1}. ${text}`);
  });
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}
