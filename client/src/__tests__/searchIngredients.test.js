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
    expect(ingredientLabelMatchesSearch("laxfilé", "l")).toBe(true);
    expect(ingredientLabelMatchesSearch("laxfilé", "la")).toBe(true);
  });

  it("matches substring in compound words (grädd → vispgrädde)", () => {
    expect(ingredientLabelMatchesSearch("vispgrädde", "grädd")).toBe(true);
    expect(ingredientLabelMatchesSearch("vispgrädde", "grädde")).toBe(true);
  });

  it("does not treat färsk as färs", () => {
    expect(ingredientLabelMatchesSearch("färsk lax", "färs")).toBe(false);
    expect(ingredientLabelMatchesSearch("färsk ingefära", "färs")).toBe(false);
    expect(ingredientLabelMatchesSearch("nötfärs", "färs")).toBe(true);
  });

  it("ignores pantry staple words as search terms", () => {
    for (const q of ["salt", "peppar", "olja", "smör", "vatten"]) {
      expect(ingredientLabelMatchesSearch("olivolja", q)).toBe(false);
      expect(ingredientLabelMatchesSearch("flingsalt", q)).toBe(false);
      expect(
        filterIngredientsByLooseSearch(
          [{ id: getIngredientId("olivolja"), label: "olivolja" }],
          q
        )
      ).toEqual([]);
    }
    expect(ingredientLabelMatchesSearch("olivolja", "oliv")).toBe(true);
  });

  it("ignores färsk as a search term but matches other words in the name", () => {
    expect(ingredientLabelMatchesSearch("färsk timjan", "färsk")).toBe(false);
    expect(ingredientLabelMatchesSearch("färsk lax", "färsk")).toBe(false);
    expect(ingredientLabelMatchesSearch("färsk timjan", "timjan")).toBe(true);
    expect(ingredientLabelMatchesSearch("färsk lax", "lax")).toBe(true);
    const catalog = [
      { id: getIngredientId("färsk timjan"), label: "färsk timjan" },
      { id: getIngredientId("timjan"), label: "timjan" },
      {
        id: "group:färs",
        label: "färs",
        isCollapsedGroup: true,
        recipeCount: 1,
      },
    ];
    expect(filterIngredientsByLooseSearch(catalog, "färsk")).toEqual([]);
    expect(
      filterIngredientsByLooseSearch(catalog, "timjan").map((h) => h.id)
    ).toEqual([getIngredientId("färsk timjan"), getIngredientId("timjan")]);
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
