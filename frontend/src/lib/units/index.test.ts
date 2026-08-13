import { describe, expect, it } from 'vitest';

import { CATEGORIES, DEFAULT_CATEGORY, getCategory, getUnit, type Category } from './index';

/**
 * US-007 - the everyday unit lists per category.
 *
 * The expectations below are written out from the acceptance criteria rather
 * than derived from the registry, so that dropping or renaming a unit in
 * index.ts fails a test instead of quietly changing what the app offers.
 */

function category(id: string): Category {
  const found = getCategory(id);
  if (!found) throw new Error('registry has no category "' + id + '"');
  return found;
}

function symbolsOf(c: Category): string[] {
  return c.units.map((u) => u.symbol);
}

function labelsOf(c: Category): string[] {
  return c.units.map((u) => u.label);
}

describe('AC-018 the length/distance category offers the everyday distance units', () => {
  it('offers mm, cm, m, km, inch, foot, yard and mile', () => {
    expect(symbolsOf(category('length'))).toEqual(
      expect.arrayContaining(['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'])
    );
  });

  it('spells each of them out for the tooltip and accessible label', () => {
    expect(labelsOf(category('length'))).toEqual(
      expect.arrayContaining([
        'millimetre',
        'centimetre',
        'metre',
        'kilometre',
        'inch',
        'foot',
        'yard',
        'mile'
      ])
    );
  });
});

describe('AC-019 each category offers its documented common metric and US/imperial units', () => {
  const expected: ReadonlyArray<[string, string[]]> = [
    ['weight', ['g', 'kg', 't', 'oz', 'lb', 'st']],
    ['volume', ['ml', 'l', 'tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal']],
    ['area', ['m²', 'km²', 'ha', 'ft²', 'yd²', 'acre', 'mi²']],
    ['speed', ['m/s', 'km/h', 'mph', 'kn']],
    ['time', ['ms', 's', 'min', 'h', 'd', 'wk']],
    ['data', ['B', 'KB', 'MB', 'GB', 'TB']]
  ];

  it.each(expected)('the %s category offers %j', (categoryId, symbols) => {
    expect(symbolsOf(category(categoryId))).toEqual(expect.arrayContaining(symbols));
  });

  it('marks the US definition of every spoon, cup, pint, quart and gallon measure', () => {
    const volume = category('volume');
    for (const localId of ['tsp', 'tbsp', 'floz', 'cup', 'pt', 'qt', 'gal']) {
      const unit = getUnit(volume, 'volume.' + localId);
      expect(unit, 'volume.' + localId + ' is missing').toBeDefined();
      expect(unit?.label).toMatch(/\(US\)/);
    }
  });

  it('states the basis of every digital data unit, in the field and in the label', () => {
    const data = category('data');

    for (const unit of data.units) {
      expect(['decimal', 'binary'], unit.id + ' has no basis').toContain(unit.dataBasis);
    }

    // The byte is the base and needs no qualifier; every multiple says which it is.
    for (const unit of data.units.filter((u) => u.factorToBase !== 1)) {
      expect(unit.label, unit.id + ' does not state its basis').toMatch(/decimal|binary/i);
    }

    expect(getUnit(data, 'data.kb')?.dataBasis).toBe('decimal');
    expect(getUnit(data, 'data.kb')?.factorToBase).toBe(1000);
    expect(getUnit(data, 'data.kib')?.dataBasis).toBe('binary');
    expect(getUnit(data, 'data.kib')?.factorToBase).toBe(1024);
  });

  it('leaves the data basis unset outside the data category', () => {
    for (const c of CATEGORIES.filter((x) => x.id !== 'data')) {
      for (const unit of c.units) {
        expect(unit.dataBasis, unit.id + ' should have no data basis').toBeNull();
      }
    }
  });

  it('gives every category a usable default pair drawn from its own units', () => {
    for (const c of CATEGORIES) {
      expect(getUnit(c, c.defaultSourceUnit), c.id + ' default source').toBeDefined();
      expect(getUnit(c, c.defaultTargetUnit), c.id + ' default target').toBeDefined();
      expect(c.defaultSourceUnit).not.toBe(c.defaultTargetUnit);
    }
  });
});

describe('AC-020 the lists stay limited to common everyday units', () => {
  // Analyst assumption: these exclusions match the 'minimal' brief and are open
  // to adjustment. If one of them is deliberately added later, remove it here.
  const obscure =
    /furlong|fathom|light[- ]?year|parsec|angstrom|\bslug\b|\bdram\b|hogshead|firkin|\brood\b|rankine|r[eé]aumur|barleycorn|league|cubit|scruple|pennyweight|\bchain\b|\bhand\b/i;

  it('offers no scientific or historical units in any category', () => {
    for (const c of CATEGORIES) {
      for (const unit of c.units) {
        expect(unit.label, c.id + ' offers ' + unit.label).not.toMatch(obscure);
        expect(unit.symbol, c.id + ' offers ' + unit.symbol).not.toMatch(obscure);
      }
    }
  });

  it('keeps every category short enough to scan without scrolling', () => {
    for (const c of CATEGORIES) {
      expect(c.units.length, c.id + ' has too few units').toBeGreaterThanOrEqual(3);
      expect(c.units.length, c.id + ' has grown past a scannable list').toBeLessThanOrEqual(9);
    }
  });

  it('excludes months and years from time, which have no fixed length', () => {
    for (const unit of category('time').units) {
      expect(unit.label).not.toMatch(/month|year/i);
    }
  });

  it('gives every unit a distinct id and a non-empty label and symbol', () => {
    const ids = CATEGORIES.flatMap((c) => c.units.map((u) => u.id));
    expect(new Set(ids).size).toBe(ids.length);

    for (const c of CATEGORIES) {
      for (const unit of c.units) {
        expect(unit.label.trim().length).toBeGreaterThan(0);
        expect(unit.symbol.trim().length).toBeGreaterThan(0);
        expect(unit.categoryId).toBe(c.id);
      }
    }
  });
});

describe('AC-021 the digital data category is analyst-added and removable', () => {
  it('exists as its own category', () => {
    expect(getCategory('data')).toBeDefined();
  });

  it('is not what the app opens on, so nothing depends on it being selected', () => {
    expect(DEFAULT_CATEGORY.id).not.toBe('data');
  });

  it('is referenced by no other category: deleting it leaves the rest whole', () => {
    const remaining = CATEGORIES.filter((c) => c.id !== 'data');
    expect(remaining).toHaveLength(CATEGORIES.length - 1);

    for (const c of remaining) {
      expect(c.defaultSourceUnit.startsWith('data.')).toBe(false);
      expect(c.defaultTargetUnit.startsWith('data.')).toBe(false);
      expect(getUnit(c, c.defaultSourceUnit)).toBeDefined();
      expect(getUnit(c, c.defaultTargetUnit)).toBeDefined();

      for (const unit of c.units) {
        expect(unit.categoryId).not.toBe('data');
      }
    }
  });

  it('owns every unit whose id is namespaced to it', () => {
    const dataUnits = CATEGORIES.flatMap((c) => c.units).filter((u) => u.id.startsWith('data.'));
    expect(dataUnits.every((u) => u.categoryId === 'data')).toBe(true);
    expect(dataUnits).toHaveLength(category('data').units.length);
  });
});
