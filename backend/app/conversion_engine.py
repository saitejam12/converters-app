"""Pure conversion functions for the Conversion Engine component.

Temperature is the one category that cannot be expressed as multiplication by a
single ratio factor: Celsius, Fahrenheit and Kelvin sit on scales that share
neither their zero point nor their step size. Each unit is therefore described
by a *scale* and an *offset* relative to a common base (degrees Celsius), and a
conversion is base-in / base-out rather than ``value * factor``.

No I/O and no network -- this mirrors the browser-side engine so the same maths
can be exercised and regression-tested server side.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

# Matches an optionally signed decimal number, e.g. "-40", "0.5", ".25", "3.".
# Negative values are deliberately accepted; there is no physical-range check.
_NUMBER_RE = re.compile(r"^-?(\d+(\.\d*)?|\.\d+)$")


@dataclass(frozen=True)
class OffsetUnit:
    """A temperature unit relative to the category base (degrees Celsius).

    ``base = value * scale + delta`` converts a reading in this unit to the
    base, and ``value = (base - delta) / scale`` converts back. The presence of
    ``delta`` is what distinguishes temperature from the ratio-only categories.
    """

    scale: float
    delta: float


# Base unit is Celsius (scale 1, offset 0). The other units carry both a scale
# and an offset -- never a lone multiplier.
TEMPERATURE_UNITS: dict[str, OffsetUnit] = {
    "c": OffsetUnit(scale=1.0, delta=0.0),
    "f": OffsetUnit(scale=5.0 / 9.0, delta=-160.0 / 9.0),
    "k": OffsetUnit(scale=1.0, delta=-273.15),
}


def _to_base(value: float, unit: OffsetUnit) -> float:
    return value * unit.scale + unit.delta


def _from_base(base: float, unit: OffsetUnit) -> float:
    return (base - unit.delta) / unit.scale


def convert_temperature(value: float, from_unit: str, to_unit: str) -> float:
    """Convert a temperature between Celsius, Fahrenheit and Kelvin.

    Uses scale-and-offset formulas, never a single ratio factor. Negative
    inputs are accepted without error and no physical-range validation applies.

    Raises ``ValueError`` if either unit key is not a known temperature unit.
    """

    try:
        source = TEMPERATURE_UNITS[from_unit.lower()]
        target = TEMPERATURE_UNITS[to_unit.lower()]
    except KeyError as exc:
        raise ValueError(f"Unknown temperature unit: {exc.args[0]!r}") from exc

    return _from_base(_to_base(value, source), target)


def _format(value: float) -> str:
    if value == 0:
        return "0"
    return f"{value:.10g}"


def convert(raw: str, from_unit: str, to_unit: str) -> str:
    """String-in / string-out temperature conversion.

    Returns a blank string for empty or unparseable input; otherwise the
    converted value with insignificant trailing zeros trimmed.
    """

    text = raw.strip()
    if not _NUMBER_RE.match(text):
        return ""
    return _format(convert_temperature(float(text), from_unit, to_unit))
