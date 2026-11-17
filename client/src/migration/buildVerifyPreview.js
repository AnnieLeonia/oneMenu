function normalizeText(text) {
  if (text == null) return "";
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function buildVerifyPreview(currentMarkdown, verifyMarkdown) {
  const current = currentMarkdown || "";

  if (verifyMarkdown == null) {
    return {
      changed: false,
      reason: "no_verify_file",
      currentMarkdown: current,
      verifyMarkdown: "",
    };
  }

  const verify = verifyMarkdown || "";
  const changed = normalizeText(current) !== normalizeText(verify);

  return {
    changed,
    reason: changed ? "differs" : "matches",
    currentMarkdown: current,
    verifyMarkdown: verify,
  };
}
