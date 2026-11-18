import {
  formatQuantity,
  parseQuantity,
  scaleQuantity,
} from "../../components/markdown/quantity";

describe("parseQuantity", () => {
  it.each([
    [null, null],
    [undefined, null],
    ["", null],
    ["   ", null],
    [2, 2],
    [1.5, 1.5],
    [NaN, null],
    ["500", 500],
    ["2.5", 2.5],
    ["1/2", 0.5],
    ["2/3", 2 / 3],
    ["1 / 4", 0.25],
    ["1 1/2", 1.5],
    ["2 3/4", 2.75],
  ])("parseQuantity(%p) → %p", (input, expected) => {
    const result = parseQuantity(input);
    if (expected == null || Number.isNaN(expected)) {
      expect(result).toBe(expected);
    } else {
      expect(result).toBeCloseTo(expected, 5);
    }
  });

  it.each(["a pinch", "1-2"])("returns null for unparseable %p", (input) => {
    expect(parseQuantity(input)).toBeNull();
  });
});

describe("formatQuantity", () => {
  it.each([
    [0, "0"],
    [3, "3"],
    [0.5, "1/2"],
    [1.5, "1 1/2"],
    [0.25, "1/4"],
    [2.75, "2 3/4"],
    [1 / 3, "1/3"],
    [2 / 3, "2/3"],
    [0.33, "1/3"],
  ])("formatQuantity(%p) → %p", (value, expected) => {
    expect(formatQuantity(value)).toBe(expected);
  });

  it.each([NaN, Infinity, -Infinity])("formatQuantity(%p) → ''", (value) => {
    expect(formatQuantity(value)).toBe("");
  });
});

describe("scaleQuantity", () => {
  it("returns input unchanged when multiplier is 1", () => {
    expect(scaleQuantity("1/2", 1)).toBe("1/2");
    expect(scaleQuantity(3, 1)).toBe(3);
  });

  it.each([
    ["1 1/2", 2, "3"],
    [3, 0.5, "1 1/2"],
    ["1/2", 2, "1"],
    [500, 2, "1000"],
    ["2/3", 3, "2"],
    ["n/a", 2, "n/a"],
  ])("scaleQuantity(%p, %p) → %p", (quantity, multiplier, expected) => {
    expect(scaleQuantity(quantity, multiplier)).toBe(expected);
  });
});
