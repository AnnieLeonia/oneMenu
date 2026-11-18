import { getIngredientId } from "../utils/recipeIngredients/normalizeIngredient";
import {
  buildFindIngredientContext,
  expandFindSelection,
  matchDishes,
} from "../utils/recipeIngredients";
import { dishWithIngredients } from "./recipeIngredientsFixtures";

const matchRecipes = (dishes, selectedNames) => {
  const { catalog, getLabel, dishIndex } = buildFindIngredientContext(dishes);
  const selectedIds = selectedNames.map((name) => getIngredientId(name));
  const matchIds = expandFindSelection(selectedIds, catalog);
  return matchDishes(dishes, matchIds, dishIndex, getLabel, selectedIds);
};

describe("matchDishes", () => {
  it("counts stor rödlök when rödlök is selected", () => {
    const dishes = [
      {
        id: 1,
        name: "Tacos",
        description: dishWithIngredients(
          1,
          "köttfärs",
          "tomater",
          "stor rödlök",
          "salt"
        ).description,
      },
    ];
    const results = matchRecipes(dishes, ["köttfärs", "tomater", "rödlök"]);
    expect(results).toHaveLength(1);
    expect(results[0].matched).toBe(3);
    expect(results[0].total).toBe(4);
  });

  it("matches tomat in recipe when tomater chip is selected", () => {
    const dishes = [
      {
        id: 1,
        name: "Sallad",
        description: dishWithIngredients(1, "tomat").description,
      },
    ];
    const results = matchRecipes(dishes, ["tomater"]);
    expect(results[0].matched).toBe(1);
  });
});
