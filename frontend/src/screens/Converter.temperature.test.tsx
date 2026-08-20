import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Screen from "@/screens/Converter";

// US-010 — temperature conversions must use scale+offset formulas, not a
// single multiplicative ratio. The existing Converter.test.tsx covers the
// English number-format criteria only; these tests cover the temperature
// acceptance criteria (AC-028..AC-031) which were otherwise untested.

function selectTemperature() {
  fireEvent.click(screen.getByRole("button", { name: "Temp" }));
}

// The From row is rendered before the To row, so getAllByTitle returns
// [fromButton, toButton] for each unit name.
function pickToUnit(name: string) {
  const buttons = screen.getAllByTitle(name);
  fireEvent.click(buttons[buttons.length - 1]);
}

describe("Converter — temperature offset formulas", () => {
  it("AC-028: 0 °C converts to 32 °F", () => {
    render(<Screen />);
    selectTemperature();

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "0" } });

    const result = screen.getByLabelText("Result in Fahrenheit") as HTMLInputElement;
    expect(result.value).toBe("32");
  });

  it("AC-029: 100 °C converts to 212 °F", () => {
    render(<Screen />);
    selectTemperature();

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "100" } });

    const result = screen.getByLabelText("Result in Fahrenheit") as HTMLInputElement;
    expect(result.value).toBe("212");
  });

  it("AC-029: 0 °C converts to 273.15 K", () => {
    render(<Screen />);
    selectTemperature();
    pickToUnit("Kelvin");

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "0" } });

    const result = screen.getByLabelText("Result in Kelvin") as HTMLInputElement;
    expect(result.value).toBe("273.15");
  });

  it("AC-029: -40 °C converts to -40 °F", () => {
    render(<Screen />);
    selectTemperature();

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "-40" } });

    const result = screen.getByLabelText("Result in Fahrenheit") as HTMLInputElement;
    expect(result.value).toBe("-40");
  });

  it("AC-030: -273.15 °C converts to 0 K with negative input accepted, no range error", () => {
    render(<Screen />);
    selectTemperature();
    pickToUnit("Kelvin");

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "-273.15" } });

    const result = screen.getByLabelText("Result in Kelvin") as HTMLInputElement;
    expect(result.value).toBe("0");
    // No physical-range validation: the input is accepted and no error text shows.
    expect(screen.queryByText(/error|invalid|range|absolute zero/i)).toBeNull();
  });

  it("AC-031: conversion is offset-based, not a single ratio through the origin", () => {
    render(<Screen />);
    selectTemperature();

    const value = screen.getByLabelText("Value in Celsius") as HTMLInputElement;
    const result = screen.getByLabelText("Result in Fahrenheit") as HTMLInputElement;

    // A pure ratio factor would map 0 -> 0. An offset formula maps 0 °C -> 32 °F.
    fireEvent.change(value, { target: { value: "0" } });
    expect(result.value).toBe("32");

    // A pure ratio would double the output when the input doubles (10 -> 20).
    // With an offset, 10 °C -> 50 °F and 20 °C -> 68 °F, which is not double.
    fireEvent.change(value, { target: { value: "10" } });
    expect(result.value).toBe("50");
    fireEvent.change(value, { target: { value: "20" } });
    expect(result.value).toBe("68");
  });
});
