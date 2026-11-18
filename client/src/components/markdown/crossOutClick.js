const INTERACTIVE_SELECTOR =
  "select, option, input, button, textarea, a, label";

export function handleCrossOutClick(event) {
  const origin = event.target;
  if (origin instanceof Element && origin.closest(INTERACTIVE_SELECTOR)) {
    return;
  }

  const crossableTags = ["li", "tr"];
  let target = origin;

  while (target instanceof Element && target.tagName) {
    const tagName = target.tagName.toLowerCase();
    if (crossableTags.includes(tagName)) {
      if (tagName === "tr" && target.closest(".recipe-meta-table")) {
        break;
      }
      target.classList.toggle("crossed-out");
      break;
    }
    target = target.parentElement;
  }
}
