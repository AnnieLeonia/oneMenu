import {
  getMarkdown,
  getRecipeShowInfo,
  getRecipeViewParts,
  scaleQuantity,
} from "../../components/markdown/recipeMarkdown";

const recipe = (body) => `---
title: Test
${body}---
`;

const SCALING_RECIPE = recipe(`ingredients:
  - name: Flour
    quantity: 500
    unit: g
  - name: Salt
    quantity: 1/2
    unit: tsp
  - name: Pepper
`);

describe("recipeMarkdown", () => {
  it.each([
    [1, ["500 g", "1/2 tsp"]],
    [2, ["1000 g", "1 tsp"]],
    [0.5, ["250 g", "1/4 tsp"]],
  ])("scales ingredients at %sx", (multiplier, snippets) => {
    const md = getMarkdown(SCALING_RECIPE, {
      ingredientMultiplier: multiplier,
    });
    snippets.forEach((s) => expect(md).toContain(s));
  });

  it.each([
    ["1 1/2", 2, "3"],
    [3, 0.5, "1 1/2"],
  ])("scaleQuantity(%p, %p)", (quantity, multiplier, expected) => {
    expect(scaleQuantity(quantity, multiplier)).toBe(expected);
  });

  it.each([
    [recipe("difficulty: Enkel\ntime: 20 min\n"), 4],
    [recipe("servings: 6\n"), 6],
  ])("getRecipeShowInfo baseServings", (yaml, servings) => {
    expect(getRecipeShowInfo(yaml).baseServings).toBe(servings);
  });

  it("getRecipeViewParts keeps trailing body after cooking", () => {
    const yaml = `${recipe(`steps:
  - Fry
ingredients:
  - name: Flour
`)}
Extra notes here.`;
    const parts = getRecipeViewParts(yaml);
    expect(parts.ingredientsMarkdown).toContain("Flour");
    expect(parts.cooking).toMatch(/^1\. Fry/);
    expect(parts.trailing).toBe("Extra notes here.");
    expect(parts.cooking).not.toContain("Extra notes");
  });

  it.each([
    [
      recipe(`difficulty: Medel
time: 30 min
servings: 4
ingredients:
  - name: Flour
    quantity: 1
    unit: g
`),
      ["🥘 Portioner", "4 portioner"],
    ],
    [recipe("servings: 6\n"), ["6 portioner"]],
  ])("includes servings in composed markdown", (yaml, snippets) => {
    const md = getMarkdown(yaml);
    snippets.forEach((s) => expect(md).toContain(s));
  });
});
