/**
 * Pure conversion maths over the bundled factor tables.
 *
 * Every function here is synchronous and offline: it reads the static registry
 * in `@/lib/units` and does arithmetic. Nothing in this module fetches, and
 * nothing in this module may start to.
 */

import type { AffineCategory, AffineUnit, Category, RatioCategory } from '@/lib/units';

/** Significant figures the result field shows. */
export const SIGNIFICANT_DIGITS = 6;

/** Accepts an optionally signed decimal, with or without a leading digit. */
export const NUMBER_PATTERN = /^-?(\d+(\.\d*)?|\.\d+)$/;

function toCelsius(v: number, unit: AffineUnit): number {
  return ((v - unit.offset) * unit.scaleNum) / unit.scaleDen;
}

function fromCelsius(v: number, unit: AffineUnit): number {
  return (v * unit.scaleDen) / unit.scaleNum + unit.offset;
}

function convertAffine(value: number, category: AffineCategory, fromKey: string, toKey: string): number {
  const a = category.units.find((u) => u.key === fromKey);
  const b = category.units.find((u) => u.key === toKey);
  if (!a || !b) return Number.NaN;
  return fromCelsius(toCelsius(value, a), b);
}

function convertRatio(value: number, category: RatioCategory, fromKey: string, toKey: string): number {
  const a = category.units.find((u) => u.key === fromKey);
  const b = category.units.find((u) => u.key === toKey);
  if (!a || !b) return Number.NaN;
  return (value * a.f) / b.f;
}

/** Convert a value between two units of the same category. NaN if unknown. */
export function convert(value: number, category: Category, fromKey: string, toKey: string): number {
  if (category.kind === 'affine') return convertAffine(value, category, fromKey, toKey);
  return convertRatio(value, category, fromKey, toKey);
}

/** Format a converted number for display at six significant figures. */
export function formatResult(n: number): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 1e-6) {
    let s = n.toExponential(SIGNIFICANT_DIGITS - 1);
    s = s.replace(/\.?0+e/, 'e');
    return s;
  }
  let s = n.toPrecision(SIGNIFICANT_DIGITS);
  if (s.indexOf('e') !== -1) return s;
  if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** True when the raw input is a number the converter can work with. */
export function isNumericInput(raw: string): boolean {
  return NUMBER_PATTERN.test(raw.trim());
}
