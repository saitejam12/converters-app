"""Tests for the temperature offset conversions (US-010)."""

import pytest

from app.conversion_engine import convert, convert_temperature


def test_ac028_celsius_zero_to_fahrenheit_is_32():
    assert convert_temperature(0, "c", "f") == pytest.approx(32)


def test_ac029_representative_conversions():
    assert convert_temperature(100, "c", "f") == pytest.approx(212)
    assert convert_temperature(0, "c", "k") == pytest.approx(273.15)
    assert convert_temperature(-40, "c", "f") == pytest.approx(-40)


def test_ac030_negative_input_accepted_absolute_zero():
    assert convert_temperature(-273.15, "c", "k") == pytest.approx(0)


def test_ac030_no_range_validation_below_absolute_zero():
    # Physically impossible, but accepted without raising.
    assert convert_temperature(-500, "c", "k") == pytest.approx(-226.85)


def test_ac031_offset_not_ratio():
    # A pure ratio factor would map 0 to 0; an offset does not.
    assert convert_temperature(0, "c", "f") != 0
    # Round trips hold across scales that carry offsets.
    assert convert_temperature(convert_temperature(37, "c", "f"), "f", "c") == pytest.approx(37)
    assert convert_temperature(convert_temperature(300, "k", "f"), "f", "k") == pytest.approx(300)


def test_same_unit_is_identity():
    assert convert_temperature(21.5, "c", "c") == pytest.approx(21.5)
    assert convert_temperature(300, "k", "k") == pytest.approx(300)


def test_unit_keys_are_case_insensitive():
    assert convert_temperature(0, "C", "F") == pytest.approx(32)


def test_unknown_unit_raises_value_error():
    with pytest.raises(ValueError):
        convert_temperature(0, "c", "rankine")


def test_convert_blank_for_empty_input():
    assert convert("", "c", "f") == ""
    assert convert("   ", "c", "f") == ""


def test_convert_blank_for_unparseable_input():
    assert convert("abc", "c", "f") == ""
    assert convert("--5", "c", "f") == ""


def test_convert_formats_clean_results():
    assert convert("0", "c", "f") == "32"
    assert convert("100", "c", "f") == "212"
    assert convert("0", "c", "k") == "273.15"
    assert convert("-40", "c", "f") == "-40"
    assert convert("-273.15", "c", "k") == "0"


def test_convert_accepts_negative_via_string():
    assert convert("-273.15", "c", "k") == "0"
