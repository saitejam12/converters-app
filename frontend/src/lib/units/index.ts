/**
 * Unit Registry & Factor Tables (architecture component: unit_registry).
 *
 * The single source of truth for the categories the converter offers, the
 * everyday units inside each one, their display labels/symbols and the
 * numbers used to convert between them. Everything here is bundled, static and
 * frozen at module load: there is no backend and no network call involved in a
 * conversion.
 *
 * Field mapping to the approved data model (snake_case there, camelCase here):
 *   category.id                  -> Category.id
 *   category.label               -> Category.label
 *   category.kind                -> Category.kind ('ratio' | 'offset')
 *   category.default_source_unit -> Category.defaultSourceUnit
 *   category.default_target_unit -> Category.defaultTargetUnit
 *   unit.id                      -> Unit.id            (namespaced "<category>.<unit>")
 *   unit.category_id             -> Unit.categoryId
 *   unit.label                   -> Unit.label
 *   unit.symbol                  -> Unit.symbol
 *   unit.factor_to_base          -> Unit.factorToBase
 *   unit.offset_scale            -> Unit.offsetScale
 *   unit.offset_delta            -> Unit.offsetDelta
 *   unit.data_basis              -> Unit.dataBasis     (null outside the data category)
 *
 * Unit ids are namespaced with their category id because unit.id is a global
 * key and two categories legitimately use the same short symbol (`ms` is a
 * millisecond in Time and a metre per second in Speed).
 *
 * Conversion contract:
 *   kind 'ratio'  -> base = value * factorToBase
 *   kind 'offset' -> base = value * offsetScale + offsetDelta
 *                    value = (base - offsetDelta) / offsetScale
 *
 * Scope of the unit lists (analyst assumption, AC-020): each list is limited to
 * the units people reach for day to day and deliberately excludes exhaustive
 * scientific and historical units (furlongs, chains, slugs, drams, fathoms,
 * light years, ...). These lists were chosen to match the 'minimal' brief and
 * are open to adjustment. See ./README.md for how to add or remove one.
 */

export type CategoryKind = 'ratio' | 'offset';

export type DataBasis = 'decimal' | 'binary';

export interface Unit {
  /** Globally unique, namespaced as "<categoryId>.<localId>". */
  readonly id: string;
  readonly categoryId: string;
  /** Spelled-out name, shown in tooltips and accessible labels. */
  readonly label: string;
  /** Short display symbol, shown on the selector chips. */
  readonly symbol: string;
  /** Multiplier to the category base unit; 1 for offset categories. */
  readonly factorToBase: number;
  /** Offset categories only: multiplier applied before the delta. */
  readonly offsetScale: number;
  /** Offset categories only: constant added after the scale. */
  readonly offsetDelta: number;
  /** Digital data units only: whether the factor is a power of 1000 or 1024. */
  readonly dataBasis: DataBasis | null;
}

export interface Category {
  readonly id: string;
  readonly label: string;
  readonly kind: CategoryKind;
  /** Unit id preselected on the "From" side when the category is chosen. */
  readonly defaultSourceUnit: string;
  /** Unit id preselected on the "To" side when the category is chosen. */
  readonly defaultTargetUnit: string;
  readonly units: readonly Unit[];
}

interface UnitSpec {
  /** Local id, unique within the category; namespaced on build. */
  readonly id: string;
  readonly label: string;
  readonly symbol: string;
  readonly factorToBase?: number;
  readonly offsetScale?: number;
  readonly offsetDelta?: number;
  readonly dataBasis?: DataBasis;
}

interface CategorySpec {
  readonly id: string;
  readonly label: string;
  readonly kind: CategoryKind;
  /** Local unit ids; namespaced on build. */
  readonly defaultSourceUnit: string;
  readonly defaultTargetUnit: string;
  readonly units: readonly UnitSpec[];
}

function defineCategory(spec: CategorySpec): Category {
  const units: readonly Unit[] = spec.units.map((u) =>
    Object.freeze<Unit>({
      id: spec.id + '.' + u.id,
      categoryId: spec.id,
      label: u.label,
      symbol: u.symbol,
      factorToBase: u.factorToBase ?? 1,
      offsetScale: u.offsetScale ?? 1,
      offsetDelta: u.offsetDelta ?? 0,
      dataBasis: u.dataBasis ?? null
    })
  );

  return Object.freeze<Category>({
    id: spec.id,
    label: spec.label,
    kind: spec.kind,
    defaultSourceUnit: spec.id + '.' + spec.defaultSourceUnit,
    defaultTargetUnit: spec.id + '.' + spec.defaultTargetUnit,
    units: Object.freeze(units)
  });
}

/** Length / distance. Base unit: metre. */
const LENGTH = defineCategory({
  id: 'length',
  label: 'Length',
  kind: 'ratio',
  defaultSourceUnit: 'km',
  defaultTargetUnit: 'mi',
  units: [
    { id: 'mm', symbol: 'mm', label: 'millimetre', factorToBase: 0.001 },
    { id: 'cm', symbol: 'cm', label: 'centimetre', factorToBase: 0.01 },
    { id: 'm', symbol: 'm', label: 'metre', factorToBase: 1 },
    { id: 'km', symbol: 'km', label: 'kilometre', factorToBase: 1000 },
    { id: 'in', symbol: 'in', label: 'inch', factorToBase: 0.0254 },
    { id: 'ft', symbol: 'ft', label: 'foot', factorToBase: 0.3048 },
    { id: 'yd', symbol: 'yd', label: 'yard', factorToBase: 0.9144 },
    { id: 'mi', symbol: 'mi', label: 'mile', factorToBase: 1609.344 }
  ]
});

/** Weight / mass. Base unit: kilogram. */
const WEIGHT = defineCategory({
  id: 'weight',
  label: 'Weight',
  kind: 'ratio',
  defaultSourceUnit: 'kg',
  defaultTargetUnit: 'lb',
  units: [
    { id: 'g', symbol: 'g', label: 'gram', factorToBase: 0.001 },
    { id: 'kg', symbol: 'kg', label: 'kilogram', factorToBase: 1 },
    { id: 't', symbol: 't', label: 'tonne (metric)', factorToBase: 1000 },
    { id: 'oz', symbol: 'oz', label: 'ounce', factorToBase: 0.028349523125 },
    { id: 'lb', symbol: 'lb', label: 'pound', factorToBase: 0.45359237 },
    { id: 'st', symbol: 'st', label: 'stone', factorToBase: 6.35029318 }
  ]
});

/** Volume / liquids. Base unit: litre. Spoon and cup measures are US. */
const VOLUME = defineCategory({
  id: 'volume',
  label: 'Volume',
  kind: 'ratio',
  defaultSourceUnit: 'l',
  defaultTargetUnit: 'gal',
  units: [
    { id: 'ml', symbol: 'ml', label: 'millilitre', factorToBase: 0.001 },
    { id: 'l', symbol: 'l', label: 'litre', factorToBase: 1 },
    { id: 'tsp', symbol: 'tsp', label: 'teaspoon (US)', factorToBase: 0.00492892159375 },
    { id: 'tbsp', symbol: 'tbsp', label: 'tablespoon (US)', factorToBase: 0.01478676478125 },
    { id: 'floz', symbol: 'fl oz', label: 'fluid ounce (US)', factorToBase: 0.0295735295625 },
    { id: 'cup', symbol: 'cup', label: 'cup (US)', factorToBase: 0.2365882365 },
    { id: 'pt', symbol: 'pt', label: 'pint (US)', factorToBase: 0.473176473 },
    { id: 'qt', symbol: 'qt', label: 'quart (US)', factorToBase: 0.946352946 },
    { id: 'gal', symbol: 'gal', label: 'gallon (US)', factorToBase: 3.785411784 }
  ]
});

/**
 * Temperature. Base unit: Celsius. This is the only offset category:
 * base = value * offsetScale + offsetDelta.
 */
const TEMPERATURE = defineCategory({
  id: 'temperature',
  label: 'Temp',
  kind: 'offset',
  defaultSourceUnit: 'c',
  defaultTargetUnit: 'f',
  units: [
    { id: 'c', symbol: '°C', label: 'Celsius', offsetScale: 1, offsetDelta: 0 },
    { id: 'f', symbol: '°F', label: 'Fahrenheit', offsetScale: 5 / 9, offsetDelta: -160 / 9 },
    { id: 'k', symbol: 'K', label: 'Kelvin', offsetScale: 1, offsetDelta: -273.15 }
  ]
});

/** Area. Base unit: square metre. */
const AREA = defineCategory({
  id: 'area',
  label: 'Area',
  kind: 'ratio',
  defaultSourceUnit: 'm2',
  defaultTargetUnit: 'ft2',
  units: [
    { id: 'm2', symbol: 'm²', label: 'square metre', factorToBase: 1 },
    { id: 'km2', symbol: 'km²', label: 'square kilometre', factorToBase: 1000000 },
    { id: 'ha', symbol: 'ha', label: 'hectare', factorToBase: 10000 },
    { id: 'ft2', symbol: 'ft²', label: 'square foot', factorToBase: 0.09290304 },
    { id: 'yd2', symbol: 'yd²', label: 'square yard', factorToBase: 0.83612736 },
    { id: 'acre', symbol: 'acre', label: 'acre', factorToBase: 4046.8564224 },
    { id: 'mi2', symbol: 'mi²', label: 'square mile', factorToBase: 2589988.110336 }
  ]
});

/** Speed. Base unit: metre per second. */
const SPEED = defineCategory({
  id: 'speed',
  label: 'Speed',
  kind: 'ratio',
  defaultSourceUnit: 'kmh',
  defaultTargetUnit: 'mph',
  units: [
    { id: 'ms', symbol: 'm/s', label: 'metre per second', factorToBase: 1 },
    { id: 'kmh', symbol: 'km/h', label: 'kilometre per hour', factorToBase: 1 / 3.6 },
    { id: 'mph', symbol: 'mph', label: 'mile per hour', factorToBase: 0.44704 },
    { id: 'kn', symbol: 'kn', label: 'knot', factorToBase: 1852 / 3600 }
  ]
});

/** Time. Base unit: second. Months and years are excluded: they are not fixed lengths. */
const TIME = defineCategory({
  id: 'time',
  label: 'Time',
  kind: 'ratio',
  defaultSourceUnit: 'h',
  defaultTargetUnit: 'min',
  units: [
    { id: 'ms', symbol: 'ms', label: 'millisecond', factorToBase: 0.001 },
    { id: 's', symbol: 's', label: 'second', factorToBase: 1 },
    { id: 'min', symbol: 'min', label: 'minute', factorToBase: 60 },
    { id: 'h', symbol: 'h', label: 'hour', factorToBase: 3600 },
    { id: 'day', symbol: 'd', label: 'day', factorToBase: 86400 },
    { id: 'week', symbol: 'wk', label: 'week', factorToBase: 604800 }
  ]
});

/**
 * Digital data storage. Base unit: byte.
 *
 * ANALYST-ADDED CATEGORY (AC-021): this category is not in the original brief.
 * It is self-contained — no other category, default or requirement refers to
 * it — so deleting this constant and its entry in CATEGORIES below removes it
 * cleanly.
 *
 * Both bases are offered because everyday use mixes them (drive makers sell
 * decimal GB, operating systems report binary GiB), and every unit states its
 * basis in its label as well as in `dataBasis`.
 */
const DATA = defineCategory({
  id: 'data',
  label: 'Data',
  kind: 'ratio',
  defaultSourceUnit: 'gb',
  defaultTargetUnit: 'mb',
  units: [
    { id: 'b', symbol: 'B', label: 'byte', factorToBase: 1, dataBasis: 'decimal' },
    { id: 'kb', symbol: 'KB', label: 'kilobyte (decimal, 1000 B)', factorToBase: 1e3, dataBasis: 'decimal' },
    { id: 'mb', symbol: 'MB', label: 'megabyte (decimal)', factorToBase: 1e6, dataBasis: 'decimal' },
    { id: 'gb', symbol: 'GB', label: 'gigabyte (decimal)', factorToBase: 1e9, dataBasis: 'decimal' },
    { id: 'tb', symbol: 'TB', label: 'terabyte (decimal)', factorToBase: 1e12, dataBasis: 'decimal' },
    { id: 'kib', symbol: 'KiB', label: 'kibibyte (binary, 1024 B)', factorToBase: 1024, dataBasis: 'binary' },
    { id: 'mib', symbol: 'MiB', label: 'mebibyte (binary)', factorToBase: 1048576, dataBasis: 'binary' },
    { id: 'gib', symbol: 'GiB', label: 'gibibyte (binary)', factorToBase: 1073741824, dataBasis: 'binary' }
  ]
});

/** Every category the converter offers, in the order they appear on screen. */
export const CATEGORIES: readonly Category[] = Object.freeze([
  LENGTH,
  WEIGHT,
  VOLUME,
  TEMPERATURE,
  AREA,
  SPEED,
  TIME,
  DATA
]);

/** The category selected on first load. */
export const DEFAULT_CATEGORY: Category = LENGTH;

/** Look a category up by id; undefined when the id is unknown. */
export function getCategory(categoryId: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === categoryId);
}

/** Look a unit up by its namespaced id within a category; undefined when unknown. */
export function getUnit(category: Category, unitId: string): Unit | undefined {
  return category.units.find((u) => u.id === unitId);
}

/**
 * Look a unit up, falling back to the category's first unit so callers always
 * have something to render. Categories are never defined empty.
 */
export function resolveUnit(category: Category, unitId: string): Unit {
  const found = getUnit(category, unitId);
  if (found) return found;
  const first = category.units[0];
  if (!first) throw new Error('Category "' + category.id + '" has no units');
  return first;
}
