/**
 * Result Formatter (result_formatter).
 *
 * Pure module, English-only, single fixed number format. It formats a numeric
 * result to ~6 significant figures, trims trailing zeros, and falls back to
 * exponential notation for very large or very small magnitudes.
 *
 * The dot is always the decimal separator. `Number.prototype.toPrecision` and
 * `toExponential` are locale-independent by specification, so there is no
 * locale-based reformatting here and no language/number-format option anywhere
 * in the product (US-012, AC-036/037/038).
 */

export const DECIMAL_SEPARATOR = ".";

export function formatResult(n: number): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "";
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
