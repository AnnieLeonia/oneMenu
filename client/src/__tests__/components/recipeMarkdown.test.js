import {
  getMarkdown,
  getRecipeBaseServings,
  scaleQuantity,
} from "../../components/markdown/recipeMarkdown";

const recipe = `---
title: Test
ingredients:
  - name: Flour
    quantity: 500
    unit: g
  - name: Salt
    quantity: 1/2
    unit: tsp
  - name: Pepper
---
`;

describe("recipeMarkdown ingredient scaling", () => {
  it("leaves amounts unchanged at 1×", () => {
    const md = getMarkdown(recipe, { ingredientMultiplier: 1 });
    expect(md).toContain("500 g");
    expect(md).toContain("1/2 tsp");
  });

  it("doubles numeric and fractional quantities", () => {
    const md = getMarkdown(recipe, { ingredientMultiplier: 2 });
    expect(md).toContain("1000 g");
    expect(md).toContain("1 tsp");
  });

  it("halves quantities", () => {
    const md = getMarkdown(recipe, { ingredientMultiplier: 0.5 });
    expect(md).toContain("250 g");
    expect(md).toContain("1/4 tsp");
  });

  it("scaleQuantity formats mixed numbers", () => {
    expect(scaleQuantity("1 1/2", 2)).toBe("3");
    expect(scaleQuantity(3, 0.5)).toBe("1 1/2");
  });

  it("includes servings in the meta table", () => {
    const md = getMarkdown(`---
title: Test
difficulty: Medel
time: 30 min
servings: 4
ingredients:
  - name: Flour
    quantity: 1
    unit: g
---
`);
    expect(md).toContain("🥘 Portioner");
    expect(md).toContain("4 portioner");
  });

  it("defaults base servings to 4 when omitted", () => {
    expect(
      getRecipeBaseServings(`---
title: Test
difficulty: Enkel
time: 20 min
---
`)
    ).toBe(4);
  });

  it("uses servings from dish front matter", () => {
    expect(
      getRecipeBaseServings(`---
title: Test
servings: 6
---
`)
    ).toBe(6);
    const md = getMarkdown(`---
title: Test
servings: 6
---
`);
    expect(md).toContain("6 portioner");
  });
});
