# Unit Registry & Factor Tables

`index.ts` in this folder is the only place unit data lives. It is bundled with
the app, frozen at load and used directly by the Converter screen — there is no
backend, no API call and no runtime fetch behind a conversion.

## What is in each category

The base unit is the unit with a factor of 1; every other factor is expressed
against it.

| Category | Base | Units offered |
| --- | --- | --- |
| Length | metre | mm, cm, m, km, in, ft, yd, mi |
| Weight | kilogram | g, kg, t (metric tonne), oz, lb, st |
| Volume | litre | ml, l, tsp (US), tbsp (US), fl oz (US), cup (US), pt (US), qt (US), gal (US) |
| Temp | Celsius | °C, °F, K |
| Area | square metre | m², km², ha, ft², yd², acre, mi² |
| Speed | metre per second | m/s, km/h, mph, kn |
| Time | second | ms, s, min, h, d, wk |
| Data | byte | B, KB, MB, GB, TB (decimal, ×1000) and KiB, MiB, GiB (binary, ×1024) |

Notes on the choices:

- **Volume** spoon, cup, pint, quart and gallon measures are the **US**
  definitions and say so in their labels, so a UK reader is not misled.
- **Time** stops at the week. Months and years are not fixed lengths, so a
  single factor would be a guess dressed as an answer.
- **Data** states the basis of every unit in its label and in the `dataBasis`
  field (`decimal` = powers of 1000, `binary` = powers of 1024), because
  everyday use mixes the two: drives are sold in decimal GB, operating systems
  report binary GiB.

## Deliberate exclusions (analyst assumption)

The lists are limited to units people actually use day to day. Exhaustive
scientific and historical units — furlong, chain, fathom, light year, slug,
dram, hogshead, rood, Rankine, Réaumur, and so on — are intentionally absent so
the selector stays scannable without scrolling. This matches the 'minimal'
brief; it is an assumption, and the lists are open to adjustment.

## The Data category is analyst-added

Digital data storage was **not** in the original brief; it was added by the
analyst. Nothing else in the registry or the app refers to it: no other
category, default or requirement depends on it. To remove it, delete the `DATA`
constant in `index.ts` and its entry in the `CATEGORIES` array. Nothing else
changes.

## Adding a unit

Add one entry to the category's `units` array:

```ts
{ id: 'nmi', symbol: 'nmi', label: 'nautical mile', factorToBase: 1852 }
```

- `id` is local to the category; the registry namespaces it to
  `length.nmi` so that the same short name can exist in two categories
  (`ms` is a millisecond in Time and a metre per second in Speed).
- `symbol` is what appears on the selector chip, `label` is the spelled-out
  name used in tooltips and accessible labels — keep both short.
- `factorToBase` is how many base units one of this unit is worth. Prefer an
  exact expression (`1852 / 3600`) over a rounded decimal.
- `dataBasis` is only for the Data category.

## Adding a category

Call `defineCategory` with an `id`, a short `label` for the tab, a `kind`, the
default source and target unit ids, and the unit list; then add the constant to
`CATEGORIES`.

- `kind: 'ratio'` — conversion is a pure multiplication:
  `base = value * factorToBase`.
- `kind: 'offset'` — conversion needs a scale and a shift:
  `base = value * offsetScale + offsetDelta`, inverted as
  `value = (base - offsetDelta) / offsetScale`. Temperature is the only such
  category today.

The category tab strip on the Converter screen is laid out for eight tabs
(4 columns on small screens, 8 on wide). A ninth category will wrap onto a
second row; check the screen before adding one.
