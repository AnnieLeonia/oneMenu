export function toggleCrossOut(event) {
  let el = event.target;
  while (el instanceof Element) {
    const tag = el.tagName.toLowerCase();
    if (tag === "li" || tag === "tr") {
      el.classList.toggle("crossed-out");
      break;
    }
    el = el.parentElement;
  }
}
