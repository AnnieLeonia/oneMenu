import yaml from "js-yaml";

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseFrontMatter(input) {
  const str = String(input).replace(/^\uFEFF/, "");
  const match = str.match(FENCE);
  if (!match) return { data: {}, content: str };

  const [, matter, content] = match;
  if (!matter.replace(/^\s*#[^\n]+/gm, "").trim()) {
    return { data: {}, content };
  }
  return { data: yaml.safeLoad(matter), content };
}
