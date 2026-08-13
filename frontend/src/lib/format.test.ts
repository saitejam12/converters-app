import { describe, expect, it } from 'vitest';

import formatResultDefault, { SIGNIFICANT_FIGURES, formatResult } from './format';

/**
 * Count the significant digits carried by a formatted result, so a criterion
 * about "about 6 significant figures" can be asserted as a property and not
 * only as a handful of golden strings.
 */
function significantDigits(formatted: string): number {
  const mantissa = formatted.split('e')[0].replace('-', '');
  const digits = mantissa.replace('.', '');
  return digits.replace(/^0+/, '').replace(/0+$/, '').length;
}

describe('formatResult', () => {
  it('exposes 6 as the significant figure budget', () => {
    expect(SIGNIFICANT_FIGURES).toBe(6);
  });

  it('is also the default export', () => {
    expect(formatResultDefault).toBe(formatResult);
  });

  describe('AC-032: results with many decimal places are shown to ~6 significant figures', () => {
    it('rounds a repeating decimal to six figures', () => {
      expect(formatResult(1 / 3)).toBe('0.333333');
      expect(formatResult(2 / 3)).toBe('0.666667');
    });

    it('rounds a long mixed number to six figures', () => {
      expect(formatResult(1234.56789)).toBe('1234.57');
      expect(formatResult(0.6213711922373339)).toBe('0.621371');
      expect(formatResult(123456789)).toBe('123457000');
    });

    it('never emits more than six significant digits', () => {
      const values = [
        1 / 3,
        1 / 7,
        Math.PI,
        Math.E,
        1609.344 * 3.14159265,
        0.028349523125 / 0.45359237,
        1 / 1609.344,
        123456789.987654,
        9.87654321e-5,
        4.9384756e11
      ];

      for (const value of values) {
        expect(significantDigits(formatResult(value))).toBeLessThanOrEqual(SIGNIFICANT_FIGURES);
      }
    });

    it('does not leak the full double-precision expansion', () => {
      expect(formatResult(1 / 3)).not.toContain('3333333');
    });
  });

  describe('AC-033: trailing zeros are trimmed', () => {
    it('reads 2.500000 as 2.5 and 5.000000 as 5', () => {
      expect(formatResult(2.5)).toBe('2.5');
      expect(formatResult(2.500000000001)).toBe('2.5');
      expect(formatResult(5)).toBe('5');
      expect(formatResult(5.000000000001)).toBe('5');
    });

    it('keeps a single trailing significant digit', () => {
      expect(formatResult(1.1)).toBe('1.1');
      expect(formatResult(1.10000004)).toBe('1.1');
      expect(formatResult(150)).toBe('150');
    });

    it('leaves no formatted value ending in a redundant zero or dot', () => {
      const values = [2.5, 5, 1.1, 0.5, 100, 2500, 0.0001, 1e-12, 1e12];

      for (const value of values) {
        const formatted = formatResult(value);
        expect(formatted).not.toMatch(/\.\d*0$/);
        expect(formatted).not.toMatch(/\.$/);
      }
    });

    it('trims the mantissa in exponential notation too', () => {
      expect(formatResult(1e-12)).toBe('1e-12');
      expect(formatResult(5.5e12)).toBe('5.5e+12');
    });
  });

  describe('AC-034: very large and very small magnitudes fall back to exponential notation', () => {
    it('formats 1 byte in terabytes as an exponential, not a run of zeros', () => {
      expect(formatResult(1 / 1e12)).toBe('1e-12');
    });

    it('formats a very large magnitude as an exponential', () => {
      expect(formatResult(1e12)).toBe('1e+12');
      expect(formatResult(1e9)).toBe('1e+9');
      expect(formatResult(1.23456789e15)).toBe('1.23457e+15');
    });

    it('formats a very small magnitude as an exponential', () => {
      expect(formatResult(9.99e-7)).toBe('9.99e-7');
      expect(formatResult(1.23456789e-9)).toBe('1.23457e-9');
    });

    it('keeps ordinary magnitudes in plain decimal notation', () => {
      expect(formatResult(0.000001)).toBe('0.000001');
      expect(formatResult(1609344)).toBe('1609340');
      expect(formatResult(2.20462)).toBe('2.20462');
      expect(formatResult(1609344)).not.toContain('e');
    });

    it('keeps the sign on exponential results', () => {
      expect(formatResult(-1e-12)).toBe('-1e-12');
      expect(formatResult(-2.5e12)).toBe('-2.5e+12');
    });
  });

  describe('AC-035: double-precision artefacts are suppressed by the rounding', () => {
    it('shows 0.1 + 0.2 as 0.3', () => {
      expect(0.1 + 0.2).not.toBe(0.3); // the artefact really is there
      expect(formatResult(0.1 + 0.2)).toBe('0.3');
    });

    it('shows a division artefact as the round number it should be', () => {
      expect(0.1 / 0.001).not.toBe(100); // 100.00000000000001
      expect(formatResult(0.1 / 0.001)).toBe('100');
    });

    it('suppresses artefacts just above and just below a round value', () => {
      expect(formatResult(1.0000000000000002)).toBe('1');
      expect(formatResult(2.9999999999999996)).toBe('3');
      expect(formatResult(0.30000000000000004)).toBe('0.3');
    });
  });

  describe('edge cases', () => {
    it('formats zero as 0', () => {
      expect(formatResult(0)).toBe('0');
      expect(formatResult(-0)).toBe('0');
    });

    it('formats non-finite input as an empty string', () => {
      expect(formatResult(Number.NaN)).toBe('');
      expect(formatResult(Number.POSITIVE_INFINITY)).toBe('');
      expect(formatResult(Number.NEGATIVE_INFINITY)).toBe('');
    });

    it('keeps the sign on negative decimal results', () => {
      expect(formatResult(-40)).toBe('-40');
      expect(formatResult(-0.6213711922373339)).toBe('-0.621371');
    });

    it('always uses a dot as the decimal separator and no grouping', () => {
      expect(formatResult(1234567.89)).toBe('1234570');
      expect(formatResult(1234.5678)).toBe('1234.57');
      expect(formatResult(1234.5678)).not.toContain(',');
      expect(formatResult(1234567.89)).not.toContain(',');
    });
  });
});
