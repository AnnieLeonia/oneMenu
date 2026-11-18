import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

export default function markdownToHtml(markdown) {
  if (!markdown) return;
  const html = micromark(markdown, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  return { __html: html };
}
