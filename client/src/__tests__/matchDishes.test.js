import { buildCatalog, expandSelection } from "../utils/ingredients/catalog";
import { getIngredientId } from "../utils/ingredients/normalize";
import { matchDishes } from "../utils/ingredients/match";
import { dishWithIngredients } from "../testHelpers/ingredientsFixtures";

const matchRecipes = (dishes, selectedNames) => {
  const { catalog, getLabel, dishIndex } = buildCatalog(dishes);
  const selectedIds = selectedNames.map((name) => getIngredientId(name));
  const matchIds = expandSelection(selectedIds, catalog);
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
