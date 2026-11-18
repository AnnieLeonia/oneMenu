import {
  buildRecipeView,
  recipeContext,
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
    const { ingredientsMarkdown } = buildRecipeView(
      recipeContext(SCALING_RECIPE),
      multiplier
    );
    snippets.forEach((s) => expect(ingredientsMarkdown).toContain(s));
  });

  it.each([
    [
      recipe("difficulty: Enkel\ntime: 20 min\n"),
      { baseServings: 4, showMetaTable: true },
    ],
    [recipe("servings: 6\n"), { baseServings: 6, showMetaTable: true }],
    [
      recipe(`difficulty: Medel
time: 30 min
servings: 4
ingredients:
  - name: Flour
    quantity: 1
    unit: g
`),
      { baseServings: 4, showMetaTable: true },
    ],
  ])("recipeContext servings and meta", (yaml, expected) => {
    const ctx = recipeContext(yaml);
    expect(ctx.baseServings).toBe(expected.baseServings);
    expect(ctx.showMetaTable).toBe(expected.showMetaTable);
  });

  it("buildRecipeView keeps trailing body after cooking", () => {
    const yaml = `${recipe(`steps:
  - Fry
ingredients:
  - name: Flour
`)}
Extra notes here.`;
    const view = buildRecipeView(recipeContext(yaml));
    expect(view.ingredientsMarkdown).toContain("Flour");
    expect(view.cooking).toMatch(/^1\. Fry/);
    expect(view.trailing).toBe("Extra notes here.");
    expect(view.cooking).not.toContain("Extra notes");
  });
});
