import { getIngredientId } from "../utils/recipeIngredients/normalizeIngredient";
import {
  buildFindIngredientContext,
  expandFindSelection,
  matchDishes,
  buildDishIngredientIndex,
} from "../utils/recipeIngredients";

describe("matchDishes", () => {
  it("counts stor rödlök when rödlök is selected", () => {
    const dishes = [
      {
        id: 1,
        name: "Tacos",
        description: `---
ingredients:
  - name: köttfärs
  - name: tomater
  - name: stor rödlök
  - name: salt
---`,
      },
    ];
    const { catalog, getLabel } = buildFindIngredientContext(dishes);
    const index = buildDishIngredientIndex(dishes);
    const selectedIds = [
      getIngredientId("köttfärs"),
      getIngredientId("tomater"),
      getIngredientId("rödlök"),
    ];
    const matchIds = expandFindSelection(selectedIds, catalog);
    const results = matchDishes(dishes, matchIds, index, getLabel, selectedIds);
    expect(results).toHaveLength(1);
    expect(results[0].matched).toBe(3);
    expect(results[0].total).toBe(4);
  });

  it("matches tomat in recipe when tomater chip is selected", () => {
    const dishes = [
      {
        id: 1,
        name: "Sallad",
        description: `---
ingredients:
  - name: tomat
---`,
      },
    ];
    const index = buildDishIngredientIndex(dishes);
    const { catalog, getLabel } = buildFindIngredientContext(dishes);
    const tomaterId = getIngredientId("tomater");
    const selectedIds = [tomaterId];
    const matchIds = expandFindSelection(selectedIds, catalog);
    const results = matchDishes(dishes, matchIds, index, getLabel, selectedIds);
    expect(results[0].matched).toBe(1);
  });
});
