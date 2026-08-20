// result_formatter — Result Formatter (SCR-001 support module)
//
// Formats numeric results to ~6 significant figures, trims trailing zeros,
// and falls back to exponential notation for very large/small magnitudes.
//
// English-only, single number format: this module ALWAYS uses a dot ('.') as
// the decimal separator and never performs any locale-based reformatting.
// It relies on Number.prototype.toPrecision / toExponential, both of which
// emit a dot decimal separator independent of the browser locale, and it
// never calls toLocaleString or Intl.NumberFormat. There is no configuration:
// there is exactly one output format.

/**
 * Format a numeric conversion result for display.
 *
 * - Non-finite values (NaN, ±Infinity) and non-numbers produce an empty string.
 * - Zero produces "0".
 * - Magnitudes >= 1e9 or < 1e-6 use exponential notation (e.g. "1.23457e+9").
 * - Otherwise 6 significant figures with trailing zeros trimmed.
 * - The decimal separator is always a dot, in every browser locale.
 */
export function formatResult(n: number): string {
  if (typeof n !== "number" || !isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 1e-6) {
    let s = n.toExponential(5);
    s = s.replace(/\.?0+e/, "e");
    return s;
  }
  let s = n.toPrecision(6);
  if (s.indexOf("e") !== -1) return s;
  if (s.indexOf(".") !== -1) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}
