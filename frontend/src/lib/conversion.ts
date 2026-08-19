// Conversion Engine — pure conversion functions with no I/O.
//
// Ratio-based conversion via factor lookup for length/weight/volume/area/
// speed/time/data, and scale+offset formulas for temperature. Temperature
// units are described as `value_in_celsius = value * scale + offset` and the
// inverse `value = (celsius - offset) / scale`, so Celsius, Fahrenheit and
// Kelvin convert with correct offsets rather than a single ratio factor.

export interface Unit {
  key: string;
  sym: string;
  name: string;
  /** Ratio factor to the category base unit (ratio categories only). */
  f?: number;
  /** Scale relative to the Celsius base (temperature only). */
  scale?: number;
  /** Offset relative to the Celsius base (temperature only). */
  offset?: number;
}

export interface Category {
  id: string;
  label: string;
  from: string;
  to: string;
  temp?: boolean;
  units: Unit[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'length',
    label: 'Length',
    from: 'km',
    to: 'mi',
    units: [
      { key: 'mm', sym: 'mm', name: 'millimetre', f: 0.001 },
      { key: 'cm', sym: 'cm', name: 'centimetre', f: 0.01 },
      { key: 'm', sym: 'm', name: 'metre', f: 1 },
      { key: 'km', sym: 'km', name: 'kilometre', f: 1000 },
      { key: 'in', sym: 'in', name: 'inch', f: 0.0254 },
      { key: 'ft', sym: 'ft', name: 'foot', f: 0.3048 },
      { key: 'yd', sym: 'yd', name: 'yard', f: 0.9144 },
      { key: 'mi', sym: 'mi', name: 'mile', f: 1609.344 }
    ]
  },
  {
    id: 'weight',
    label: 'Weight',
    from: 'kg',
    to: 'lb',
    units: [
      { key: 'g', sym: 'g', name: 'gram', f: 0.001 },
      { key: 'kg', sym: 'kg', name: 'kilogram', f: 1 },
      { key: 't', sym: 't', name: 'tonne (metric)', f: 1000 },
      { key: 'oz', sym: 'oz', name: 'ounce', f: 0.028349523125 },
      { key: 'lb', sym: 'lb', name: 'pound', f: 0.45359237 },
      { key: 'st', sym: 'st', name: 'stone', f: 6.35029318 }
    ]
  },
  {
    id: 'volume',
    label: 'Volume',
    from: 'l',
    to: 'gal',
    units: [
      { key: 'ml', sym: 'ml', name: 'millilitre', f: 0.001 },
      { key: 'l', sym: 'l', name: 'litre', f: 1 },
      { key: 'tsp', sym: 'tsp', name: 'teaspoon (US)', f: 0.00492892159375 },
      { key: 'tbsp', sym: 'tbsp', name: 'tablespoon (US)', f: 0.01478676478125 },
      { key: 'floz', sym: 'fl oz', name: 'fluid ounce (US)', f: 0.0295735295625 },
      { key: 'cup', sym: 'cup', name: 'cup (US)', f: 0.2365882365 },
      { key: 'pt', sym: 'pt', name: 'pint (US)', f: 0.473176473 },
      { key: 'qt', sym: 'qt', name: 'quart (US)', f: 0.946352946 },
      { key: 'gal', sym: 'gal', name: 'gallon (US)', f: 3.785411784 }
    ]
  },
  {
    id: 'temperature',
    label: 'Temp',
    from: 'c',
    to: 'f',
    temp: true,
    units: [
      // scale + offset are expressed relative to the Celsius base unit:
      //   celsius = value * scale + offset
      { key: 'c', sym: '°C', name: 'Celsius', scale: 1, offset: 0 },
      { key: 'f', sym: '°F', name: 'Fahrenheit', scale: 5 / 9, offset: -160 / 9 },
      { key: 'k', sym: 'K', name: 'Kelvin', scale: 1, offset: -273.15 }
    ]
  },
  {
    id: 'area',
    label: 'Area',
    from: 'm2',
    to: 'ft2',
    units: [
      { key: 'm2', sym: 'm²', name: 'square metre', f: 1 },
      { key: 'km2', sym: 'km²', name: 'square kilometre', f: 1000000 },
      { key: 'ha', sym: 'ha', name: 'hectare', f: 10000 },
      { key: 'ft2', sym: 'ft²', name: 'square foot', f: 0.09290304 },
      { key: 'yd2', sym: 'yd²', name: 'square yard', f: 0.83612736 },
      { key: 'acre', sym: 'acre', name: 'acre', f: 4046.8564224 },
      { key: 'mi2', sym: 'mi²', name: 'square mile', f: 2589988.110336 }
    ]
  },
  {
    id: 'speed',
    label: 'Speed',
    from: 'kmh',
    to: 'mph',
    units: [
      { key: 'ms', sym: 'm/s', name: 'metre per second', f: 1 },
      { key: 'kmh', sym: 'km/h', name: 'kilometre per hour', f: 1 / 3.6 },
      { key: 'mph', sym: 'mph', name: 'mile per hour', f: 0.44704 },
      { key: 'kn', sym: 'kn', name: 'knot', f: 1852 / 3600 }
    ]
  },
  {
    id: 'time',
    label: 'Time',
    from: 'h',
    to: 'min',
    units: [
      { key: 'ms', sym: 'ms', name: 'millisecond', f: 0.001 },
      { key: 's', sym: 's', name: 'second', f: 1 },
      { key: 'min', sym: 'min', name: 'minute', f: 60 },
      { key: 'h', sym: 'h', name: 'hour', f: 3600 },
      { key: 'day', sym: 'd', name: 'day', f: 86400 },
      { key: 'week', sym: 'wk', name: 'week', f: 604800 }
    ]
  },
  {
    id: 'data',
    label: 'Data',
    from: 'gb',
    to: 'mb',
    units: [
      { key: 'b', sym: 'B', name: 'byte', f: 1 },
      { key: 'kb', sym: 'KB', name: 'kilobyte (decimal, 1000 B)', f: 1e3 },
      { key: 'mb', sym: 'MB', name: 'megabyte (decimal)', f: 1e6 },
      { key: 'gb', sym: 'GB', name: 'gigabyte (decimal)', f: 1e9 },
      { key: 'tb', sym: 'TB', name: 'terabyte (decimal)', f: 1e12 },
      { key: 'kib', sym: 'KiB', name: 'kibibyte (binary, 1024 B)', f: 1024 },
      { key: 'mib', sym: 'MiB', name: 'mebibyte (binary)', f: 1048576 },
      { key: 'gib', sym: 'GiB', name: 'gibibyte (binary)', f: 1073741824 }
    ]
  }
];

export const NUM_RE = /^-?(\d+(\.\d*)?|\.\d+)$/;

/**
 * Convert `value` from `fromKey` to `toKey` within a category.
 *
 * Temperature uses scale + offset (via a Celsius base); every other category
 * uses ratio factors. Negative inputs are accepted with no range validation.
 */
export function convert(value: number, cat: Category, fromKey: string, toKey: string): number {
  const a = cat.units.find((u) => u.key === fromKey);
  const b = cat.units.find((u) => u.key === toKey);
  if (!a || !b) return NaN;

  if (cat.temp) {
    const scaleA = a.scale ?? 1;
    const offsetA = a.offset ?? 0;
    const scaleB = b.scale ?? 1;
    const offsetB = b.offset ?? 0;
    const celsius = value * scaleA + offsetA;
    return (celsius - offsetB) / scaleB;
  }

  return (value * (a.f ?? 1)) / (b.f ?? 1);
}

/** Format a numeric result to 6 significant figures, blank for non-finite. */
export function formatResult(n: number): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 1e-6) {
    let s = n.toExponential(5);
    s = s.replace(/\.?0+e/, 'e');
    return s;
  }
  let s = n.toPrecision(6);
  if (s.indexOf('e') !== -1) return s;
  if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
