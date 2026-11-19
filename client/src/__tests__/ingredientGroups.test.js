import { buildCatalog, expandSelection } from "../utils/ingredients/catalog";
import { INGREDIENT_GROUP_DEFS, groupIdFor } from "../utils/ingredients/groups";
import { matchDishes } from "../utils/ingredients/match";
import {
  getIngredientId,
  isExcludedFromPicker,
} from "../utils/ingredients/normalize";
import {
  dishWithIngredients,
  repeatIngredientDishes,
} from "../testHelpers/ingredientsFixtures";

const groupDef = (id) => INGREDIENT_GROUP_DEFS.find((d) => d.id === id);

const expectCollapsedGroup = ({
  dishes,
  groupId,
  hiddenMemberName,
  expandCount,
}) => {
  const { catalog } = buildCatalog(dishes);
  expect(catalog.some((ing) => ing.id === groupId)).toBe(true);
  if (hiddenMemberName) {
    expect(
      catalog.find((ing) => ing.id === getIngredientId(hiddenMemberName))
        ?.hiddenFromDefaultList
    ).toBe(true);
  }
  const group = catalog.find((ing) => ing.id === groupId);
  expect(expandSelection([group.id], catalog).length).toBe(expandCount);
};

describe("isExcludedFromPicker", () => {
  test.each([
    ["salt", true],
    ["olivolja", true],
    ["smör", true],
    ["vatten", true],
    ["vetemjöl", true],
    ["mjölk", true],
    ["is", true],
    ["ris", true],
    ["jasminris", true],
    ["risvinäger", true],
    ["vitvinsvinäger", true],
    ["strösocker", true],
    ["kinesisk soja", true],
    ["pasta", true],
    ["vodka", true],
    ["gin", true],
    ["kycklingfilé", false],
    ["fisk", false],
  ])("%s excluded=%s", (name, excluded) => {
    expect(isExcludedFromPicker(getIngredientId(name))).toBe(excluded);
  });

  it("omits staples from the finder catalog", () => {
    const { catalog } = buildCatalog(repeatIngredientDishes("salt", 3));
    expect(catalog.find((ing) => ing.id === getIngredientId("salt"))).toBe(
      undefined
    );
  });
});

describe("collapsed group chips", () => {
  test.each([
    [
      "vitlök",
      "group:vitlök",
      [
        [1, "vitlöksklyfta"],
        [2, "vitlök"],
        [3, "vitlöksklyftor"],
        [4, "vitlök"],
      ],
      "vitlöksklyfta",
      3,
    ],
    [
      "färs",
      "group:färs",
      [
        [1, "nötfärs"],
        [2, "köttfärs"],
        [3, "fläskfärs"],
        [4, "köttfärs"],
      ],
      "nötfärs",
      3,
    ],
    [
      "kycklingfilé",
      "group:kycklingfile",
      [
        [1, "kycklingfiléer"],
        [2, "strimlad kycklingfilé"],
        [3, "strimlad kycklingfilé"],
        [4, "kycklingfiléer"],
      ],
      "strimlad kycklingfilé",
      2,
    ],
    [
      "sallad",
      "group:sallad",
      [
        [1, "sallad"],
        [2, "sallad"],
        [3, "blandad sallad"],
        [4, "sallad"],
      ],
      "blandad sallad",
      2,
    ],
    [
      "parmesan",
      "group:parmesan",
      [
        [1, "riven parmesan"],
        [2, "parmesanost"],
        [3, "riven parmesan"],
        [4, "parmesanost"],
      ],
      "riven parmesan",
      2,
    ],
    [
      "bacon",
      "group:bacon",
      [
        [1, "tärnat bacon"],
        [2, "bacon"],
        [3, "bacon skivat"],
        [4, "bacon"],
      ],
      "tärnat bacon",
      3,
    ],
  ])(
    "lists %s as one chip and hides variants",
    (_, groupId, rows, hiddenMember, expandCount) => {
      const dishes = rows.map(([id, name]) => dishWithIngredients(id, name));
      expectCollapsedGroup({
        dishes,
        groupId,
        hiddenMemberName: hiddenMember,
        expandCount,
      });
    }
  );

  it("lists buljong and fond as single chips", () => {
    const dishes = [
      [1, "kycklingbuljong"],
      [2, "köttfond"],
      [3, "fiskbuljong"],
      [6, "kycklingbuljong"],
      [4, "grönsaksfond"],
      [5, "grönsaksfond"],
      [7, "oxbuljong"],
      [8, "skaldjursfond"],
    ].map(([id, name]) => dishWithIngredients(id, name));
    const { catalog } = buildCatalog(dishes);
    expect(catalog.some((ing) => ing.id === "group:buljong")).toBe(true);
    expect(catalog.some((ing) => ing.id === "group:fond")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("kycklingbuljong"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const buljong = catalog.find((ing) => ing.id === "group:buljong");
    expect(expandSelection([buljong.id], catalog).length).toBe(3);
    const fond = catalog.find((ing) => ing.id === "group:fond");
    expect(expandSelection([fond.id], catalog).length).toBe(3);
  });
});

describe("ingredientGroups", () => {
  it("assigns strimlad kycklingfilé to kycklingfilé group", () => {
    const filé = groupDef("group:kycklingfile");
    expect(groupIdFor(getIngredientId("strimlad kycklingfilé"))).toBe(filé.id);
    expect(groupIdFor(getIngredientId("kycklingvingar"))).toBe(null);
  });

  it("assigns buljong and fond before kycklingfilé", () => {
    const buljong = groupDef("group:buljong");
    const fond = groupDef("group:fond");
    const filé = groupDef("group:kycklingfile");
    const cube = getIngredientId("kycklingbuljongtärning");
    expect(groupIdFor(cube)).toBe(buljong.id);
    expect(groupIdFor(cube)).not.toBe(filé.id);
    expect(groupIdFor(getIngredientId("kycklingfond"))).toBe(fond.id);
    expect(groupIdFor(getIngredientId("kycklingfilé"))).toBe(filé.id);
  });

  test.each([
    ["fläskfilé", "group:fläskfile"],
    ["fläskfärs", "group:färs"],
    ["nötfärs", "group:färs"],
    ["köttfärs", "group:färs"],
  ])("assigns %s to %s", (name, groupId) => {
    expect(groupIdFor(getIngredientId(name))).toBe(groupDef(groupId).id);
  });

  test.each([
    "kycklingvingar",
    "fläskkarré i bit",
    "fläskkarré",
    "strimlat nötkött",
  ])("%s is not assigned to a collapsed group", (name) => {
    expect(groupIdFor(getIngredientId(name))).toBe(null);
  });

  it("matches dishes when all group member ids are passed", () => {
    const dishes = [
      {
        id: 1,
        name: "Fläskrätt",
        description: dishWithIngredients(1, "fläskkarré", "salt").description,
      },
    ];
    const id = getIngredientId("fläskkarré");
    const { dishIndex, getLabel } = buildCatalog(dishes);
    const results = matchDishes(dishes, [id], dishIndex, getLabel, [id]);
    expect(results).toHaveLength(1);
    expect(results[0].dish.id).toBe(1);
  });
});
