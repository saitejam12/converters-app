/**
 * Result Formatter (result_formatter).
 *
 * A pure module: no React, no DOM, no network. It turns a raw double-precision
 * conversion result into the string the Converter screen shows.
 *
 * Rules, in order:
 *  - non-finite input (NaN, Infinity) formats as an empty string, so the screen
 *    simply shows nothing rather than "NaN";
 *  - zero (including -0) formats as "0";
 *  - values of ordinary magnitude are rounded to ~6 significant figures and
 *    rendered in plain decimal notation with trailing zeros trimmed, which also
 *    suppresses floating-point artefacts such as 0.30000000000000004;
 *  - very large or very small magnitudes fall back to exponential notation
 *    rather than a long run of zeros.
 *
 * The decimal separator is always a dot and the output is English only: this is
 * deliberate, so a copied result pastes cleanly into other tools regardless of
 * the visitor's locale.
 */

/** How many significant figures a displayed result carries. */
export const SIGNIFICANT_FIGURES = 6;

/** At or above this magnitude, plain decimal notation becomes unreadable. */
const EXPONENTIAL_UPPER_BOUND = 1e9;

/** Below this magnitude, plain decimal notation is mostly leading zeros. */
const EXPONENTIAL_LOWER_BOUND = 1e-6;

/**
 * Trim trailing zeros (and a bare trailing dot) from the mantissa of a string
 * produced by Number#toExponential, e.g. "1.00000e-12" -> "1e-12".
 */
function trimExponential(exponential: string): string {
  const separator = exponential.indexOf('e');
  if (separator === -1) return exponential;

  let mantissa = exponential.slice(0, separator);
  const exponent = exponential.slice(separator);

  if (mantissa.indexOf('.') !== -1) {
    mantissa = mantissa.replace(/0+$/, '').replace(/\.$/, '');
  }

  return mantissa + exponent;
}

/**
 * Round to SIGNIFICANT_FIGURES and render in plain decimal notation.
 *
 * Re-parsing the rounded string with Number() is what drops the trailing zeros:
 * 2.500000 becomes 2.5 and 5.00000 becomes 5, with no string surgery needed.
 */
function formatDecimal(value: number): string {
  const rounded = Number(value.toPrecision(SIGNIFICANT_FIGURES));
  const text = rounded.toString();

  // Number#toString switches to exponential notation outside roughly
  // 1e-7 .. 1e21. Callers keep us well inside that window, but if rounding ever
  // pushes a value across the edge, emit a tidied exponential rather than a
  // string with an untrimmed mantissa.
  if (text.indexOf('e') !== -1) {
    return trimExponential(rounded.toExponential(SIGNIFICANT_FIGURES - 1));
  }

  return text;
}

/**
 * Format a conversion result for display.
 *
 * @param value the raw result of the conversion arithmetic
 * @returns the display string, or '' when there is nothing sensible to show
 */
export function formatResult(value: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  if (value === 0) return '0';

  const magnitude = Math.abs(value);

  if (magnitude >= EXPONENTIAL_UPPER_BOUND || magnitude < EXPONENTIAL_LOWER_BOUND) {
    return trimExponential(value.toExponential(SIGNIFICANT_FIGURES - 1));
  }

  return formatDecimal(value);
}

export default formatResult;
