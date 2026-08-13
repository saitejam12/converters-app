import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { convert, formatResult, isNumericInput, SIGNIFICANT_DIGITS } from '@/lib/convert';
import { CATEGORIES, getCategory, type AffineCategory, type RatioCategory } from '@/lib/units';

/** Anything the module under test does to the network lands here. */
const netCalls: string[] = [];
let undoTraps: Array<() => void> = [];

function trapNetwork(): void {
  netCalls.length = 0;
  undoTraps = [];

  const globals = globalThis as unknown as Record<string, unknown>;

  const realFetch = globals.fetch;
  globals.fetch = (...args: unknown[]) => {
    netCalls.push('fetch ' + String(args[0]));
    return Promise.reject(new Error('the converter must not use the network'));
  };
  undoTraps.push(() => {
    if (realFetch === undefined) delete globals.fetch;
    else globals.fetch = realFetch;
  });

  if (typeof XMLHttpRequest !== 'undefined') {
    const realOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function trappedOpen(this: XMLHttpRequest, ...args: unknown[]) {
      netCalls.push('xhr ' + String(args[0]) + ' ' + String(args[1]));
      throw new Error('the converter must not use the network');
    } as unknown as typeof XMLHttpRequest.prototype.open;
    undoTraps.push(() => {
      XMLHttpRequest.prototype.open = realOpen;
    });
  }

  const nav = globals.navigator as { sendBeacon?: (url: string, data?: unknown) => boolean } | undefined;
  if (nav && typeof nav.sendBeacon === 'function') {
    const realBeacon = nav.sendBeacon;
    nav.sendBeacon = (url: string) => {
      netCalls.push('beacon ' + url);
      return false;
    };
    undoTraps.push(() => {
      nav.sendBeacon = realBeacon;
    });
  }
}

function releaseNetwork(): void {
  undoTraps.forEach((undo) => undo());
  undoTraps = [];
}

function ratioCategories(): RatioCategory[] {
  return CATEGORIES.filter((c): c is RatioCategory => c.kind === 'ratio');
}

/** Known conversions taken from the definitions, not from the table under test. */
const KNOWN: Array<[string, string, string, number, number]> = [
  ['length', 'km', 'm', 1, 1000],
  ['length', 'mi', 'km', 1, 1.609344],
  ['length', 'ft', 'in', 1, 12],
  ['length', 'yd', 'ft', 1, 3],
  ['weight', 'kg', 'g', 1, 1000],
  ['weight', 'st', 'lb', 1, 14],
  ['weight', 'lb', 'oz', 1, 16],
  ['weight', 'lb', 'kg', 1, 0.45359237],
  ['volume', 'l', 'ml', 1, 1000],
  ['volume', 'gal', 'qt', 1, 4],
  ['volume', 'gal', 'l', 1, 3.785411784],
  ['volume', 'cup', 'floz', 1, 8],
  ['area', 'ha', 'm2', 1, 10000],
  ['area', 'km2', 'm2', 1, 1000000],
  ['area', 'acre', 'm2', 1, 4046.8564224],
  ['speed', 'ms', 'kmh', 1, 3.6],
  ['speed', 'kn', 'kmh', 1, 1.852],
  ['speed', 'mph', 'ms', 1, 0.44704],
  ['time', 'h', 's', 1, 3600],
  ['time', 'week', 'day', 1, 7],
  ['time', 'day', 'h', 1, 24],
  ['data', 'gib', 'mib', 1, 1024],
  ['data', 'gb', 'mb', 1, 1000],
  ['data', 'kib', 'b', 1, 1024]
];

describe('convert over the bundled factor tables', () => {
  it.each(KNOWN)(
    'AC-025: %s converts %s to %s',
    (categoryId, from, to, value, expected) => {
      const result = convert(value, getCategory(categoryId), from, to);
      expect(Math.abs(result - expected)).toBeLessThanOrEqual(Math.abs(expected) * 1e-12);
    }
  );

  it.each(ratioCategories().map((c) => [c.id, c] as [string, RatioCategory]))(
    'AC-025: %s round-trips every unit pair through its bundled factors',
    (_id, category) => {
      const value = 37.5;
      category.units.forEach((a) => {
        category.units.forEach((b) => {
          const there = convert(value, category, a.key, b.key);
          const back = convert(there, category, b.key, a.key);
          expect(Number.isFinite(there)).toBe(true);
          expect(Math.abs(back - value)).toBeLessThanOrEqual(value * 1e-9);
        });
      });
    }
  );

  it.each(ratioCategories().map((c) => [c.id, c] as [string, RatioCategory]))(
    'AC-025: %s converting via its base unit agrees with converting directly',
    (_id, category) => {
      const base = category.units.find((u) => u.f === 1);
      expect(base).toBeDefined();
      const value = 6.25;
      category.units.forEach((a) => {
        category.units.forEach((b) => {
          const direct = convert(value, category, a.key, b.key);
          const viaBase = convert(convert(value, category, a.key, base!.key), category, base!.key, b.key);
          expect(Math.abs(direct - viaBase)).toBeLessThanOrEqual(Math.abs(direct) * 1e-9);
        });
      });
    }
  );

  it('returns NaN for a unit the bundled table does not define', () => {
    const length = getCategory('length');
    expect(Number.isNaN(convert(1, length, 'furlong', 'm'))).toBe(true);
    expect(Number.isNaN(convert(1, length, 'm', 'furlong'))).toBe(true);
  });

  it('converts temperature with the bundled offset and scale parameters', () => {
    const temperature = getCategory('temperature') as AffineCategory;
    expect(convert(0, temperature, 'c', 'f')).toBeCloseTo(32, 12);
    expect(convert(100, temperature, 'c', 'f')).toBeCloseTo(212, 12);
    expect(convert(-40, temperature, 'c', 'f')).toBeCloseTo(-40, 12);
    expect(convert(212, temperature, 'f', 'c')).toBeCloseTo(100, 12);
    expect(convert(0, temperature, 'c', 'k')).toBeCloseTo(273.15, 12);
    expect(convert(273.15, temperature, 'k', 'c')).toBeCloseTo(0, 12);
  });
});

describe('formatResult', () => {
  it('shows six significant figures', () => {
    expect(SIGNIFICANT_DIGITS).toBe(6);
    expect(formatResult(1 / 3)).toBe('0.333333');
  });

  it('AC-026: renders the reference conversions at the displayed precision', () => {
    expect(formatResult(convert(1, getCategory('length'), 'mi', 'km'))).toBe('1.60934');
    expect(formatResult(convert(1, getCategory('weight'), 'lb', 'kg'))).toBe('0.453592');
    expect(formatResult(convert(1, getCategory('volume'), 'gal', 'l'))).toBe('3.78541');
    expect(formatResult(convert(1, getCategory('area'), 'acre', 'm2'))).toBe('4046.86');
  });

  it('AC-026: renders the reference conversions the other way round', () => {
    expect(formatResult(convert(1, getCategory('length'), 'km', 'mi'))).toBe('0.621371');
    expect(formatResult(convert(1, getCategory('weight'), 'kg', 'lb'))).toBe('2.20462');
    expect(formatResult(convert(1, getCategory('volume'), 'l', 'gal'))).toBe('0.264172');
    expect(formatResult(convert(1, getCategory('area'), 'm2', 'ft2'))).toBe('10.7639');
  });

  it('trims the padding zeros off an exact result', () => {
    expect(formatResult(convert(1, getCategory('time'), 'h', 'min'))).toBe('60');
    expect(formatResult(convert(1000, getCategory('length'), 'm', 'km'))).toBe('1');
    expect(formatResult(0)).toBe('0');
  });

  it('switches to exponent form outside the readable range', () => {
    expect(formatResult(convert(1, getCategory('data'), 'gb', 'b'))).toBe('1e+9');
    expect(formatResult(1.2e9)).toBe('1.2e+9');
    expect(formatResult(1e-7)).toBe('1e-7');
  });

  it('renders nothing for a value that is not a number', () => {
    expect(formatResult(Number.NaN)).toBe('');
    expect(formatResult(Number.POSITIVE_INFINITY)).toBe('');
  });
});

describe('isNumericInput', () => {
  it.each([['12', true], ['-3.5', true], ['.5', true], ['0.', true], ['  7  ', true], ['', false], ['-', false], ['abc', false], ['1e3', false], ['1,5', false], ['1.2.3', false]])(
    'reads %s as usable=%s',
    (raw, usable) => {
      expect(isNumericInput(raw as string)).toBe(usable);
    }
  );
});

describe('AC-027 no network', () => {
  beforeEach(() => {
    trapNetwork();
  });

  afterEach(() => {
    releaseNetwork();
  });

  it('converts every unit of every category without touching the network', () => {
    CATEGORIES.forEach((category) => {
      category.units.forEach((a) => {
        category.units.forEach((b) => {
          const result = convert(12.5, category, a.key, b.key);
          expect(Number.isFinite(result)).toBe(true);
          expect(formatResult(result)).not.toBe('');
        });
      });
    });

    expect(netCalls).toEqual([]);
  });

  it('loads its factor tables from the bundle rather than from a request', async () => {
    vi.resetModules();

    const units = await import('@/lib/units');
    const lib = await import('@/lib/convert');

    expect(netCalls).toEqual([]);
    expect(units.CATEGORIES).toHaveLength(8);
    expect(lib.convert(1, units.getCategory('length'), 'mi', 'km')).toBeCloseTo(1.609344, 12);
    expect(netCalls).toEqual([]);
  });
});
