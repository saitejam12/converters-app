import { describe, expect, it } from 'vitest';

import {
  CATEGORIES,
  findUnit,
  getCategory,
  type AffineCategory,
  type Category,
  type RatioCategory,
  type RatioUnit
} from '@/lib/units';

/** The categories AC-025 names as ratio based. */
const RATIO_CATEGORY_IDS = ['length', 'weight', 'volume', 'area', 'speed', 'time', 'data'] as const;

function factor(categoryId: string, key: string): number {
  const category = getCategory(categoryId) as RatioCategory;
  const unit = category.units.find((u) => u.key === key);
  if (!unit) throw new Error('category "' + categoryId + '" has no unit "' + key + '"');
  return unit.f;
}

describe('bundled unit registry', () => {
  it('ships all eight categories in the source module', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'length',
      'weight',
      'volume',
      'temperature',
      'area',
      'speed',
      'time',
      'data'
    ]);
  });

  it.each(RATIO_CATEGORY_IDS)(
    'AC-025: %s is a ratio category whose every unit carries a bundled factor',
    (id) => {
      const category = getCategory(id);
      expect(category.kind).toBe('ratio');

      const units = (category as RatioCategory).units;
      expect(units.length).toBeGreaterThan(1);

      units.forEach((unit: RatioUnit) => {
        expect(Number.isFinite(unit.f)).toBe(true);
        expect(unit.f).toBeGreaterThan(0);
        expect(unit.sym.length).toBeGreaterThan(0);
        expect(unit.name.length).toBeGreaterThan(0);
      });

      // Exactly one base unit, so every factor in the table is on one scale.
      expect(units.filter((unit) => unit.f === 1)).toHaveLength(1);
    }
  );

  it.each(CATEGORIES.map((c) => [c.id, c] as [string, Category]))(
    '%s has unique unit keys and defaults that resolve to real units',
    (_id, category) => {
      const keys = category.units.map((u) => u.key);
      expect(new Set(keys).size).toBe(keys.length);
      expect(category.units.some((u) => u.key === category.from)).toBe(true);
      expect(category.units.some((u) => u.key === category.to)).toBe(true);
      expect(category.label.length).toBeGreaterThan(0);
    }
  );

  it('AC-026: stores the exact definitional factors for the reference units', () => {
    expect(factor('length', 'mi')).toBe(1609.344);
    expect(factor('weight', 'lb')).toBe(0.45359237);
    expect(factor('volume', 'gal')).toBe(3.785411784);
    expect(factor('area', 'acre')).toBe(4046.8564224);
  });

  it('describes temperature as an affine category rather than a ratio one', () => {
    const temperature = getCategory('temperature');
    expect(temperature.kind).toBe('affine');

    const units = (temperature as AffineCategory).units;
    expect(units.map((u) => u.key)).toEqual(['c', 'f', 'k']);
    units.forEach((unit) => {
      expect(Number.isFinite(unit.offset)).toBe(true);
      expect(unit.scaleNum).toBeGreaterThan(0);
      expect(unit.scaleDen).toBeGreaterThan(0);
    });
  });

  it('falls back to the first category when asked for one that is not bundled', () => {
    expect(getCategory('furlongs-per-fortnight').id).toBe(CATEGORIES[0].id);
  });

  it('falls back to the first unit when asked for one the category does not have', () => {
    const length = getCategory('length');
    expect(findUnit(length, 'mi').key).toBe('mi');
    expect(findUnit(length, 'parsec').key).toBe(length.units[0].key);
  });
});
