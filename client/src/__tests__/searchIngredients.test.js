import { expandSelection } from "../utils/ingredients/catalog";
import { getIngredientId } from "../utils/ingredients/normalize";
import {
  expandLabelVariants,
  filterBySearch,
  labelMatchesSearch,
  makeSearchChipId,
} from "../utils/ingredients/search";

const rawIng = (name, extra = {}) => ({
  id: getIngredientId(name),
  label: name,
  ...extra,
});

const groupChip = (slug, recipeCount = 10) => ({
  id: `group:${slug}`,
  label: slug,
  isCollapsedGroup: true,
  recipeCount,
});

describe("ingredient search", () => {
  it("includes variant names that share the first word", () => {
    const catalog = [
      { id: "a", label: "laxfilé" },
      { id: "b", label: "laxfilé i bit med skinn" },
      { id: "c", label: "lax" },
    ];
    const hits = filterBySearch(catalog, "laxfilé");
    expect(hits.map((h) => h.id).sort()).toEqual(["a", "b"]);
  });

  test.each([
    ["laxfilé", "lax", true],
    ["laxfilé", "l", true],
    ["laxfilé", "la", true],
    ["vispgrädde", "grädd", true],
    ["vispgrädde", "grädde", true],
    ["färsk lax", "färs", false],
    ["färsk ingefära", "färs", false],
    ["nötfärs", "färs", true],
    ["tomat", "tomater", true],
    ["strimlad kalkon, kyckling eller skinka", "kycklingfilé", false],
    ["pizzabullar", "kycklingfilé", false],
  ])('labelMatchesSearch("%s", "%s") → %s', (label, query, expected) => {
    expect(labelMatchesSearch(label, query)).toBe(expected);
  });

  it("ignores pantry staple words as search terms", () => {
    const olivolja = rawIng("olivolja");
    for (const q of ["salt", "peppar", "olja", "smör", "vatten"]) {
      expect(labelMatchesSearch("olivolja", q)).toBe(false);
      expect(labelMatchesSearch("flingsalt", q)).toBe(false);
      expect(filterBySearch([olivolja], q)).toEqual([]);
    }
    expect(labelMatchesSearch("olivolja", "oliv")).toBe(true);
  });

  it("ignores färsk as a search term but matches other words in the name", () => {
    expect(labelMatchesSearch("färsk timjan", "färsk")).toBe(false);
    expect(labelMatchesSearch("färsk lax", "färsk")).toBe(false);
    expect(labelMatchesSearch("färsk timjan", "timjan")).toBe(true);
    expect(labelMatchesSearch("färsk lax", "lax")).toBe(true);
    const catalog = [
      rawIng("färsk timjan"),
      rawIng("timjan"),
      groupChip("färs", 1),
    ];
    expect(filterBySearch(catalog, "färsk")).toEqual([]);
    expect(filterBySearch(catalog, "timjan").map((h) => h.id)).toEqual([
      getIngredientId("färsk timjan"),
      getIngredientId("timjan"),
    ]);
  });

  it("searching färs does not pull in unrelated sallad family", () => {
    const catalog = [
      groupChip("färs"),
      groupChip("sallad", 8),
      rawIng("blandad sallad", { recipeCount: 4 }),
      rawIng("sallad med köttfärs", { recipeCount: 1 }),
      rawIng("nötfärs", { recipeCount: 5 }),
    ];
    const hitIds = filterBySearch(catalog, "färs").map((h) => h.id);
    expect(hitIds).toEqual(["group:färs"]);
    expect(hitIds).not.toContain("group:sallad");
    expect(hitIds).not.toContain(getIngredientId("blandad sallad"));
  });

  test.each([
    ["group only", [groupChip("färs")], "köttfärs"],
    [
      "member hidden behind group",
      [rawIng("köttfärs", { recipeCount: 5 }), groupChip("färs")],
      "köttfärs",
    ],
  ])("finds collapsed färs chip (%s)", (_, catalog, query) => {
    expect(filterBySearch(catalog, query).map((h) => h.id)).toEqual([
      "group:färs",
    ]);
  });

  it("expands search: selection with loose search", () => {
    const shortId = getIngredientId("laxfilé");
    const longId = getIngredientId("laxfilé i bit med skinn");
    const catalog = [
      { id: shortId, label: "laxfilé" },
      { id: longId, label: "laxfilé i bit med skinn" },
      rawIng("lax", { recipeCount: 1 }),
    ];
    const searchId = makeSearchChipId("laxfi");
    expect(expandSelection([searchId], catalog).sort()).toEqual(
      [shortId, longId].sort()
    );
  });

  it("expands selection to longer labels with the same stem", () => {
    const shortId = getIngredientId("laxfilé");
    const longId = getIngredientId("laxfilé i bit med skinn");
    const catalog = [
      { id: shortId, label: "laxfilé" },
      { id: longId, label: "laxfilé i bit med skinn" },
    ];
    expect(expandLabelVariants(shortId, catalog).sort()).toEqual(
      [shortId, longId].sort()
    );
  });
});
