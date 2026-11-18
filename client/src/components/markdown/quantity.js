import { isNaN, isNil, isNumber, toString } from "lodash/fp";

const FRACTION_TOLERANCE = 0.02;

/** Denominators used when displaying scaled amounts as mixed numbers. */
const COMMON_FRACTIONS = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
];

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const SIMPLE_FRACTION_PATTERN = /^(\d+)\s*\/\s*(\d+)$/;
const MIXED_FRACTION_PATTERN = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/;

export function parseQuantity(quantity) {
  if (isNil(quantity) || quantity === "") return null;
  if (isNumber(quantity) && !isNaN(quantity)) return quantity;

  const s = toString(quantity).trim();
  if (!s) return null;
  if (DECIMAL_PATTERN.test(s)) return parseFloat(s);

  const fraction = SIMPLE_FRACTION_PATTERN.exec(s);
  if (fraction) {
    return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  }

  const mixed = MIXED_FRACTION_PATTERN.exec(s);
  if (mixed) {
    return (
      parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10)
    );
  }

  return null;
}

function formatAsCommonFraction(whole, fracPart, tolerance) {
  for (const [num, den] of COMMON_FRACTIONS) {
    const f = num / den;
    if (Math.abs(fracPart - f) < tolerance) {
      return whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
    }
  }
  return null;
}

export function formatQuantity(value) {
  if (!Number.isFinite(value)) return "";

  const whole = Math.floor(value + FRACTION_TOLERANCE);
  const fracPart = value - whole;

  if (Math.abs(fracPart) < FRACTION_TOLERANCE) return String(whole);

  const asFraction = formatAsCommonFraction(
    whole,
    fracPart,
    FRACTION_TOLERANCE
  );
  if (asFraction) return asFraction;

  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

export function scaleQuantity(quantity, multiplier) {
  if (multiplier === 1) return quantity;
  const parsed = parseQuantity(quantity);
  if (parsed == null) return quantity;
  return formatQuantity(parsed * multiplier);
}
