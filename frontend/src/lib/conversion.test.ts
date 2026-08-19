import { describe, expect, it } from 'vitest';

import { CATEGORIES, convert, formatResult } from './conversion';

const temp = CATEGORIES.find((c) => c.id === 'temperature')!;

function display(value: number, fromKey: string, toKey: string): string {
  return formatResult(convert(value, temp, fromKey, toKey));
}

describe('temperature conversion (scale + offset)', () => {
  it('AC-028: 0 °C converts to 32 °F', () => {
    expect(display(0, 'c', 'f')).toBe('32');
  });

  it('AC-029: 100 °C → 212 °F, 0 °C → 273.15 K, -40 °C → -40 °F', () => {
    expect(display(100, 'c', 'f')).toBe('212');
    expect(display(0, 'c', 'k')).toBe('273.15');
    expect(display(-40, 'c', 'f')).toBe('-40');
  });

  it('AC-030: -273.15 °C converts to 0 K, negatives accepted without error', () => {
    expect(display(-273.15, 'c', 'k')).toBe('0');
    expect(() => convert(-273.15, temp, 'c', 'k')).not.toThrow();
  });

  it('AC-031: temperature units carry scale and offset, not a single ratio factor', () => {
    for (const u of temp.units) {
      expect(u.scale).toBeTypeOf('number');
      expect(u.offset).toBeTypeOf('number');
      expect(u.f).toBeUndefined();
    }
    // The engine is a genuine offset, not a ratio: F is not a multiple of C.
    expect(convert(0, temp, 'c', 'f')).not.toBe(0);
  });

  it('round-trips F → C → F', () => {
    expect(display(98.6, 'f', 'c')).toBe('37');
    expect(display(37, 'c', 'f')).toBe('98.6');
  });
});

describe('ratio conversion still works', () => {
  it('length: 1 km is 1000 m', () => {
    const length = CATEGORIES.find((c) => c.id === 'length')!;
    expect(formatResult(convert(1, length, 'km', 'm'))).toBe('1000');
  });
});
