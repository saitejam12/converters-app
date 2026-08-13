import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";

const CATEGORIES = [
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
      { key: 'c', sym: '°C', name: 'Celsius' },
      { key: 'f', sym: '°F', name: 'Fahrenheit' },
      { key: 'k', sym: 'K', name: 'Kelvin' }
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

const KEYS = ['7', '8', '9', 'back', '4', '5', '6', 'clear', '1', '2', '3', 'sign', '0', '.'];

const NUM_RE = /^-?(\d+(\.\d*)?|\.\d+)$/;

function toCelsius(v, key) {
  if (key === 'c') return v;
  if (key === 'f') return (v - 32) * 5 / 9;
  return v - 273.15;
}

function fromCelsius(v, key) {
  if (key === 'c') return v;
  if (key === 'f') return v * 9 / 5 + 32;
  return v + 273.15;
}

function convert(value, cat, fromKey, toKey) {
  if (cat.temp) return fromCelsius(toCelsius(value, fromKey), toKey);
  const a = cat.units.find(function (u) { return u.key === fromKey; });
  const b = cat.units.find(function (u) { return u.key === toKey; });
  if (!a || !b) return NaN;
  return (value * a.f) / b.f;
}

function formatResult(n) {
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

export default function Screen() {
  const [catId, setCatId] = React.useState('length');
  const [raw, setRaw] = React.useState('');
  const cat = CATEGORIES.find(function (c) { return c.id === catId; });
  const [fromKey, setFromKey] = React.useState(cat.from);
  const [toKey, setToKey] = React.useState(cat.to);

  const fromUnit = cat.units.find(function (u) { return u.key === fromKey; }) || cat.units[0];
  const toUnit = cat.units.find(function (u) { return u.key === toKey; }) || cat.units[0];

  const trimmed = raw.trim();
  const valid = NUM_RE.test(trimmed);
  const value = valid ? parseFloat(trimmed) : NaN;
  const result = valid ? formatResult(convert(value, cat, fromUnit.key, toUnit.key)) : '';
  const unitRate = formatResult(convert(1, cat, fromUnit.key, toUnit.key));

  function pickCategory(id) {
    const next = CATEGORIES.find(function (c) { return c.id === id; });
    setCatId(id);
    setFromKey(next.from);
    setToKey(next.to);
  }

  function press(k) {
    if (k === 'clear') { setRaw(''); return; }
    if (k === 'back') { setRaw(function (r) { return r.slice(0, -1); }); return; }
    if (k === 'sign') {
      setRaw(function (r) { return r.charAt(0) === '-' ? r.slice(1) : '-' + r; });
      return;
    }
    if (k === '.') {
      setRaw(function (r) { return r.indexOf('.') !== -1 ? r : (r === '' || r === '-' ? r + '0.' : r + '.'); });
      return;
    }
    setRaw(function (r) { return r === '0' ? k : r + k; });
  }

  const accent = brand.accentColor;
  const gold = brand.primaryColor;
  const panel = '#11181D';
  const line = '#1E272D';

  function unitRow(label, selected, onPick, describedBy) {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>
            {label}
          </span>
          <span className="text-[11px]" style={{ color: brand.neutralColor }} id={describedBy}>
            {selected.name}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {cat.units.map(function (u) {
            const on = u.key === selected.key;
            return (
              <button
                key={u.key}
                type="button"
                aria-pressed={on}
                title={u.name}
                onClick={function () { onPick(u.key); }}
                className="px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD1C5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C1013]"
                style={{
                  borderRadius: brand.radius,
                  border: '1px solid ' + (on ? accent : line),
                  backgroundColor: on ? 'rgba(79,209,197,0.12)' : 'transparent',
                  color: on ? accent : '#C6D0D6'
                }}
              >
                {u.sym}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-2" style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody }}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white" style={{ fontFamily: brand.fontHeading }}>
            Converter
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: brand.neutralColor }}>
            Eight categories, live results, nothing stored. Works offline.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:gap-6 lg:items-start">
          <section className="space-y-5">
            <div
              className="overflow-hidden"
              style={{ backgroundColor: panel, border: '1px solid ' + line, borderRadius: 'calc(' + brand.radius + ' * 1.6)' }}
            >
              <div className="px-5 sm:px-7 pt-5 pb-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>
                    Value
                  </span>
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: brand.neutralColor }}>
                    {cat.label}
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck="false"
                    aria-label={'Value in ' + fromUnit.name}
                    placeholder="0"
                    value={raw}
                    onChange={function (e) { setRaw(e.target.value); }}
                    className="min-w-0 flex-1 bg-transparent text-right text-4xl sm:text-5xl font-light tabular-nums text-white placeholder:text-[#3B464D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD1C5] rounded"
                    style={{ letterSpacing: '-0.02em' }}
                  />
                  <span className="pb-1 text-lg font-medium shrink-0" style={{ color: '#98A5AC' }}>{fromUnit.sym}</span>
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: line }} />

              <div className="px-5 sm:px-7 pt-5 pb-6" style={{ backgroundColor: '#0E1418' }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brand.neutralColor }}>
                    Result · read only
                  </span>
                  <span className="text-[11px]" style={{ color: brand.neutralColor }}>
                    {valid ? '1 ' + fromUnit.sym + ' = ' + unitRate + ' ' + toUnit.sym : '6 significant figures'}
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <input
                    readOnly
                    tabIndex={-1}
                    aria-live="polite"
                    aria-label={'Result in ' + toUnit.name}
                    value={result}
                    className="min-w-0 flex-1 cursor-text select-all bg-transparent text-right text-5xl sm:text-6xl font-light tabular-nums focus:outline-none"
                    style={{ color: gold, letterSpacing: '-0.03em' }}
                  />
                  <span className="pb-1.5 text-lg font-medium shrink-0" style={{ color: result ? gold : '#3B464D' }}>
                    {toUnit.sym}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="space-y-5 px-5 sm:px-6 py-5"
              style={{ backgroundColor: panel, border: '1px solid ' + line, borderRadius: 'calc(' + brand.radius + ' * 1.6)' }}
            >
              {unitRow('From', fromUnit, setFromKey, 'from-name')}
              <div style={{ height: 1, backgroundColor: line }} />
              {unitRow('To', toUnit, setToKey, 'to-name')}
            </div>
          </section>

          <section
            className="p-4 sm:p-5"
            style={{ backgroundColor: panel, border: '1px solid ' + line, borderRadius: 'calc(' + brand.radius + ' * 1.6)' }}
          >
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {KEYS.map(function (k) {
                const isAction = k === 'back' || k === 'clear' || k === 'sign';
                const label = k === 'back' ? '⌫' : k === 'clear' ? 'C' : k === 'sign' ? '±' : k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={function () { press(k); }}
                    aria-label={k === 'back' ? 'Delete last character' : k === 'clear' ? 'Clear value' : k === 'sign' ? 'Toggle sign' : k}
                    className={
                      'h-14 sm:h-16 text-xl font-medium transition-colors active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD1C5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11181D] ' +
                      (k === '0' ? 'col-span-2' : '')
                    }
                    style={{
                      borderRadius: brand.radius,
                      border: '1px solid ' + line,
                      backgroundColor: isAction ? 'transparent' : '#161E24',
                      color: isAction ? brand.neutralColor : '#E9EEF1'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed" style={{ color: brand.neutralColor }}>
              Type directly into the value field or use the pad. The result updates on every keystroke — there is nothing to submit.
            </p>
          </section>
        </div>

        <nav aria-label="Measurement category" className="mt-6">
          <div
            className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2"
            style={{ backgroundColor: panel, border: '1px solid ' + line, borderRadius: 'calc(' + brand.radius + ' * 1.6)' }}
          >
            {CATEGORIES.map(function (c) {
              const on = c.id === catId;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={function () { pickCategory(c.id); }}
                  className="h-14 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD1C5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11181D]"
                  style={{
                    borderRadius: brand.radius,
                    backgroundColor: on ? 'rgba(79,209,197,0.13)' : 'transparent',
                    color: on ? accent : '#8E9AA1',
                    boxShadow: on ? 'inset 0 0 0 1px ' + accent : 'none'
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </nav>

        <p className="mt-5 text-center text-[11px]" style={{ color: '#5E6B72' }}>
          Conversions run on this device · no history, no accounts, no tracking
        </p>
      </div>
    </div>
  );
}
