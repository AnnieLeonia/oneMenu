import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

export function createMarkup(description) {
  if (!description) return;
  const html = micromark(description, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });

  return { __html: html };
}
