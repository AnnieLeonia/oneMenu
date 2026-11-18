import {
  INGREDIENT_GROUP_DEFS,
  normalizedIngredientIdAssignedGroupId,
} from "../utils/recipeIngredients/ingredientGroups";
import {
  getIngredientId,
  isFinderExcludedIngredient,
} from "../utils/recipeIngredients/normalizeIngredient";
import { matchDishes } from "../utils/recipeIngredients/matchDishes";
import {
  buildFindIngredientContext,
  expandFindSelection,
} from "../utils/recipeIngredients/parseDishIngredients";

const groupDef = (id) => INGREDIENT_GROUP_DEFS.find((d) => d.id === id);

describe("isFinderExcludedIngredient", () => {
  it("excludes staple ingredients", () => {
    expect(isFinderExcludedIngredient(getIngredientId("salt"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("olivolja"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("smör"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("vatten"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("vetemjöl"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("mjölk"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("is"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("ris"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("jasminris"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("risvinäger"))).toBe(
      true
    );
    expect(isFinderExcludedIngredient(getIngredientId("vitvinsvinäger"))).toBe(
      true
    );
    expect(isFinderExcludedIngredient(getIngredientId("strösocker"))).toBe(
      true
    );
    expect(isFinderExcludedIngredient(getIngredientId("kinesisk soja"))).toBe(
      true
    );
    expect(isFinderExcludedIngredient(getIngredientId("pasta"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("vodka"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("gin"))).toBe(true);
    expect(isFinderExcludedIngredient(getIngredientId("kycklingfilé"))).toBe(
      false
    );
    expect(isFinderExcludedIngredient(getIngredientId("fisk"))).toBe(false);
  });

  it("omits staples from the finder catalog", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: salt
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: salt
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: salt
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.find((ing) => ing.id === getIngredientId("salt"))).toBe(
      undefined
    );
  });
});

describe("collapsed group chips", () => {
  it("lists vitlök as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: vitlöksklyfta
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: vitlök
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: vitlöksklyftor
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: vitlök
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:vitlök")).toBe(true);
    const member = catalog.find(
      (ing) => ing.id === getIngredientId("vitlöksklyfta")
    );
    expect(member).toBeDefined();
    expect(member.hiddenFromDefaultList).toBe(true);
    const vitlök = catalog.find((ing) => ing.id === "group:vitlök");
    expect(expandFindSelection([vitlök.id], catalog).length).toBe(3);
  });

  it("lists färs as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: nötfärs
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: köttfärs
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: fläskfärs
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: köttfärs
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:färs")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("nötfärs"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const färs = catalog.find((ing) => ing.id === "group:färs");
    expect(expandFindSelection([färs.id], catalog).length).toBe(3);
  });

  it("lists buljong and fond as single chips", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: kycklingbuljong
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: köttfond
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: fiskbuljong
---`,
      },
      {
        id: 6,
        description: `---
ingredients:
  - name: kycklingbuljong
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: grönsaksfond
---`,
      },
      {
        id: 5,
        description: `---
ingredients:
  - name: grönsaksfond
---`,
      },
      {
        id: 7,
        description: `---
ingredients:
  - name: oxbuljong
---`,
      },
      {
        id: 8,
        description: `---
ingredients:
  - name: skaldjursfond
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:buljong")).toBe(true);
    expect(catalog.some((ing) => ing.id === "group:fond")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("kycklingbuljong"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const buljong = catalog.find((ing) => ing.id === "group:buljong");
    expect(expandFindSelection([buljong.id], catalog).length).toBe(3);
    const fond = catalog.find((ing) => ing.id === "group:fond");
    expect(expandFindSelection([fond.id], catalog).length).toBe(3);
  });

  it("lists kycklingfilé as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: kycklingfiléer
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: strimlad kycklingfilé
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: strimlad kycklingfilé
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: kycklingfiléer
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:kycklingfile")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("strimlad kycklingfilé"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const filé = catalog.find((ing) => ing.id === "group:kycklingfile");
    expect(expandFindSelection([filé.id], catalog).length).toBe(2);
  });

  it("lists sallad as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: sallad
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: sallad
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: blandad sallad
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: sallad
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:sallad")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("blandad sallad"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const sallad = catalog.find((ing) => ing.id === "group:sallad");
    expect(expandFindSelection([sallad.id], catalog).length).toBe(2);
  });

  it("lists parmesan as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: riven parmesan
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: parmesanost
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: riven parmesan
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: parmesanost
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:parmesan")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("riven parmesan"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const parmesan = catalog.find((ing) => ing.id === "group:parmesan");
    expect(expandFindSelection([parmesan.id], catalog).length).toBe(2);
  });

  it("lists bacon as one chip and hides variants", () => {
    const dishes = [
      {
        id: 1,
        description: `---
ingredients:
  - name: tärnat bacon
---`,
      },
      {
        id: 2,
        description: `---
ingredients:
  - name: bacon
---`,
      },
      {
        id: 3,
        description: `---
ingredients:
  - name: bacon skivat
---`,
      },
      {
        id: 4,
        description: `---
ingredients:
  - name: bacon
---`,
      },
    ];
    const { catalog } = buildFindIngredientContext(dishes);
    expect(catalog.some((ing) => ing.id === "group:bacon")).toBe(true);
    expect(
      catalog.find((ing) => ing.id === getIngredientId("tärnat bacon"))
        ?.hiddenFromDefaultList
    ).toBe(true);
    const bacon = catalog.find((ing) => ing.id === "group:bacon");
    expect(expandFindSelection([bacon.id], catalog).length).toBe(3);
  });
});

describe("ingredientGroups", () => {
  it("assigns strimlad kycklingfilé to kycklingfilé group", () => {
    const filé = groupDef("group:kycklingfile");
    expect(
      normalizedIngredientIdAssignedGroupId(
        getIngredientId("strimlad kycklingfilé")
      )
    ).toBe(filé.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("kycklingvingar"))
    ).toBe(null);
  });

  it("assigns buljong and fond before kycklingfilé", () => {
    const buljong = groupDef("group:buljong");
    const fond = groupDef("group:fond");
    const filé = groupDef("group:kycklingfile");
    const cube = getIngredientId("kycklingbuljongtärning");
    expect(normalizedIngredientIdAssignedGroupId(cube)).toBe(buljong.id);
    expect(normalizedIngredientIdAssignedGroupId(cube)).not.toBe(filé.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("kycklingfond"))
    ).toBe(fond.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("kycklingfilé"))
    ).toBe(filé.id);
  });

  it("assigns fläskfilé to fläskfile only", () => {
    const file = groupDef("group:fläskfile");
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("fläskfilé"))
    ).toBe(file.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("fläskkarré i bit"))
    ).toBe(null);
  });

  it("assigns fläskfärs to färs", () => {
    const färs = groupDef("group:färs");
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("fläskfärs"))
    ).toBe(färs.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("fläskkarré"))
    ).toBe(null);
  });

  it("matches färs variants", () => {
    const def = groupDef("group:färs");
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("nötfärs"))
    ).toBe(def.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("köttfärs"))
    ).toBe(def.id);
    expect(
      normalizedIngredientIdAssignedGroupId(getIngredientId("strimlat nötkött"))
    ).toBe(null);
  });

  it("matches dishes when all group member ids are passed", () => {
    const dishes = [
      {
        id: 1,
        name: "Fläskrätt",
        description: `---
ingredients:
  - name: fläskkarré
  - name: salt
---`,
      },
    ];
    const fläskId = getIngredientId("fläskkarré");
    const results = matchDishes(dishes, [fläskId]);
    expect(results).toHaveLength(1);
    expect(results[0].dish.id).toBe(1);
  });
});
