/**
 * Unit Registry & Factor Tables (unit_registry).
 *
 * The single, immutable source of truth for every category, unit, display
 * label/symbol and conversion factor the app knows about. Everything here is
 * a static TypeScript module: it is compiled into the bundle and tree-shaken,
 * so a conversion never needs a network request for rates, factors or data.
 *
 * Adding a unit
 * -------------
 * 1. Find the category below and append an entry to its `units` array.
 * 2. For a ratio category, `f` is the number of BASE units in one of the new
 *    unit (the base unit is the one whose `f` is 1 — metre, kilogram, litre,
 *    square metre, metre per second, second, byte).
 * 3. Give it a stable `key` (used in state), a `sym` (shown on the chips) and
 *    a `name` (shown as the long form / tooltip).
 *
 * Adding a category
 * -----------------
 * Append a new object with a unique `id`, a short `label` for the category
 * bar, `from`/`to` defaults, `kind: 'ratio'` and its units. Keep the base unit
 * at `f: 1`. Affine categories (temperature) use `kind: 'affine'` instead and
 * describe each unit with offset/scale parameters rather than a single factor.
 *
 * Factors are exact definitional values wherever one exists (for example
 * 1 mile = 1609.344 m, 1 lb = 0.45359237 kg, 1 US gallon = 3.785411784 l,
 * 1 acre = 4046.8564224 m²).
 */

export type CategoryId =
  | 'length'
  | 'weight'
  | 'volume'
  | 'temperature'
  | 'area'
  | 'speed'
  | 'time'
  | 'data';

/** Fields every unit carries, whatever its category's maths looks like. */
export interface UnitBase {
  readonly key: string;
  readonly sym: string;
  readonly name: string;
}

/** A unit of a ratio category: `base = value * f`. */
export interface RatioUnit extends UnitBase {
  readonly f: number;
}

/**
 * A unit of an affine category (temperature).
 *
 * base = (value - offset) * scaleNum / scaleDen
 * value = base * scaleDen / scaleNum + offset
 *
 * The scale is kept as an integer ratio rather than a single decimal so the
 * round trip stays exact for the everyday reference points (32 °F = 0 °C,
 * 100 °C = 212 °F) instead of drifting by a float epsilon.
 */
export interface AffineUnit extends UnitBase {
  readonly offset: number;
  readonly scaleNum: number;
  readonly scaleDen: number;
}

export type Unit = RatioUnit | AffineUnit;

interface CategoryBase {
  readonly id: CategoryId;
  /** Short label for the category bar. */
  readonly label: string;
  /** Default source unit key. */
  readonly from: string;
  /** Default target unit key. */
  readonly to: string;
}

export interface RatioCategory extends CategoryBase {
  readonly kind: 'ratio';
  readonly units: readonly RatioUnit[];
}

export interface AffineCategory extends CategoryBase {
  readonly kind: 'affine';
  readonly units: readonly AffineUnit[];
}

export type Category = RatioCategory | AffineCategory;

export const CATEGORIES: readonly Category[] = [
  {
    id: 'length',
    label: 'Length',
    kind: 'ratio',
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
    kind: 'ratio',
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
    kind: 'ratio',
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
    kind: 'affine',
    from: 'c',
    to: 'f',
    units: [
      { key: 'c', sym: '°C', name: 'Celsius', offset: 0, scaleNum: 1, scaleDen: 1 },
      { key: 'f', sym: '°F', name: 'Fahrenheit', offset: 32, scaleNum: 5, scaleDen: 9 },
      { key: 'k', sym: 'K', name: 'Kelvin', offset: 273.15, scaleNum: 1, scaleDen: 1 }
    ]
  },
  {
    id: 'area',
    label: 'Area',
    kind: 'ratio',
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
    kind: 'ratio',
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
    kind: 'ratio',
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
    kind: 'ratio',
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

/** The category with this id, falling back to the first one for safety. */
export function getCategory(id: string): Category {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ?? (CATEGORIES[0] as Category);
}

/** The unit with this key inside a category, falling back to its first unit. */
export function findUnit(category: Category, key: string): Unit {
  const found = category.units.find((u) => u.key === key);
  return found ?? (category.units[0] as Unit);
}
