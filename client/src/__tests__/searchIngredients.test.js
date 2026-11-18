import {
  expandIngredientLabelVariantIds,
  filterIngredientsByLooseSearch,
  ingredientLabelMatchesSearch,
  makeFinderSearchSelectionId,
} from "../utils/recipeIngredients/searchIngredients";
import { getIngredientId } from "../utils/recipeIngredients/normalizeIngredient";
import { expandFindSelection } from "../utils/recipeIngredients/parseDishIngredients";

describe("searchIngredients", () => {
  it("includes variant names that share the first word", () => {
    const catalog = [
      { id: "a", label: "laxfilé" },
      { id: "b", label: "laxfilé i bit med skinn" },
      { id: "c", label: "lax" },
    ];
    const hits = filterIngredientsByLooseSearch(catalog, "laxfilé");
    expect(hits.map((h) => h.id).sort()).toEqual(["a", "b"]);
  });

  it("matches partial prefix on a word", () => {
    expect(ingredientLabelMatchesSearch("laxfilé", "lax")).toBe(true);
  });

  it("does not treat färsk as färs", () => {
    expect(ingredientLabelMatchesSearch("färsk lax", "färs")).toBe(false);
    expect(ingredientLabelMatchesSearch("färsk ingefära", "färs")).toBe(false);
    expect(ingredientLabelMatchesSearch("nötfärs", "färs")).toBe(true);
  });

  it("does not match plain kyckling when searching kycklingfilé", () => {
    expect(
      ingredientLabelMatchesSearch(
        "strimlad kalkon, kyckling eller skinka",
        "kycklingfilé"
      )
    ).toBe(false);
    expect(ingredientLabelMatchesSearch("pizzabullar", "kycklingfilé")).toBe(
      false
    );
    expect(ingredientLabelMatchesSearch("tomat", "tomater")).toBe(true);
  });

  it("searching färs does not pull in unrelated sallad family", () => {
    const catalog = [
      {
        id: "group:färs",
        label: "färs",
        isCollapsedGroup: true,
        recipeCount: 10,
      },
      {
        id: "group:sallad",
        label: "sallad",
        isCollapsedGroup: true,
        recipeCount: 8,
      },
      {
        id: getIngredientId("blandad sallad"),
        label: "blandad sallad",
        recipeCount: 4,
      },
      {
        id: getIngredientId("sallad med köttfärs"),
        label: "sallad med köttfärs",
        recipeCount: 1,
      },
      {
        id: getIngredientId("nötfärs"),
        label: "nötfärs",
        recipeCount: 5,
      },
    ];
    const hits = filterIngredientsByLooseSearch(catalog, "färs");
    const hitIds = hits.map((h) => h.id);
    expect(hitIds).toEqual(["group:färs"]);
    expect(hitIds).not.toContain("group:sallad");
    expect(hitIds).not.toContain(getIngredientId("blandad sallad"));
  });

  it("finds collapsed färs chip when searching köttfärs", () => {
    const catalog = [
      {
        id: "group:färs",
        label: "färs",
        isCollapsedGroup: true,
        recipeCount: 10,
      },
    ];
    const hits = filterIngredientsByLooseSearch(catalog, "köttfärs");
    expect(hits.map((h) => h.id)).toEqual(["group:färs"]);
  });

  it("finds collapsed member by label", () => {
    const catalog = [
      {
        id: getIngredientId("köttfärs"),
        label: "köttfärs",
        recipeCount: 5,
      },
      {
        id: "group:färs",
        label: "färs",
        isCollapsedGroup: true,
        recipeCount: 10,
      },
    ];
    const hits = filterIngredientsByLooseSearch(catalog, "köttfärs");
    expect(hits.map((h) => h.id)).toEqual(["group:färs"]);
  });

  it("expands search: selection with loose search", () => {
    const shortId = getIngredientId("laxfilé");
    const longId = getIngredientId("laxfilé i bit med skinn");
    const catalog = [
      { id: shortId, label: "laxfilé" },
      { id: longId, label: "laxfilé i bit med skinn" },
      { id: getIngredientId("lax"), label: "lax", recipeCount: 1 },
    ];
    const searchId = makeFinderSearchSelectionId("laxfi");
    const expanded = expandFindSelection([searchId], catalog);
    expect(expanded.sort()).toEqual([shortId, longId].sort());
  });

  it("expands selection to longer labels with the same stem", () => {
    const shortId = getIngredientId("laxfilé");
    const longId = getIngredientId("laxfilé i bit med skinn");
    const catalog = [
      { id: shortId, label: "laxfilé" },
      { id: longId, label: "laxfilé i bit med skinn" },
    ];
    expect(expandIngredientLabelVariantIds(shortId, catalog).sort()).toEqual(
      [shortId, longId].sort()
    );
  });
});
