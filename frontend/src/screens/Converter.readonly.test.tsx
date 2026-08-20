import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Screen from "@/screens/Converter";

// US-004 — Read-only result field.
// Defaults are the Length category, km -> mi, so the fields are labelled
// "Value in kilometre" and "Result in mile".
describe("Converter — read-only result field (US-004)", () => {
  function setup() {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "10" } });
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    return { value, result };
  }

  it("AC-010: the result field is read-only and rejects typed input", () => {
    const { result } = setup();

    const before = result.value;
    // Sanity: a real converted value is on screen to attempt typing over.
    expect(before).not.toBe("");
    expect(result.readOnly).toBe(true);

    // Attempt to type/paste into the result field; the value must not change.
    fireEvent.change(result, { target: { value: "999" } });
    expect(result.value).toBe(before);

    fireEvent.input(result, { target: { value: "abc" } });
    expect(result.value).toBe(before);
  });

  it("AC-010: the result reflects only the source input, never direct edits", () => {
    const { value, result } = setup();

    // Editing the source updates the result (one-way, live).
    fireEvent.change(value, { target: { value: "20" } });
    const afterSourceEdit = result.value;
    expect(afterSourceEdit).not.toBe("");

    // Editing the result does nothing; it stays tied to the source value.
    fireEvent.change(result, { target: { value: "0" } });
    expect(result.value).toBe(afterSourceEdit);
  });

  it("AC-011: the result is visibly labelled as read-only output", () => {
    setup();
    expect(screen.getByText(/read only/i)).toBeTruthy();
  });

  it("AC-011: the result stays selectable for copying (not disabled)", () => {
    const { result } = setup();

    // read-only, not disabled: a disabled input cannot be selected or copied.
    expect(result.readOnly).toBe(true);
    expect(result.disabled).toBe(false);
  });
});
