import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Screen from "@/screens/Converter";

describe("Converter — English-only single number format", () => {
  it("AC-036: accepts a dot decimal separator and converts correctly", () => {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1.5" } });

    // 1.5 km -> mi = 1.5 * 1000 / 1609.344 = 0.932057 (6 sig figs)
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("0.932057");
  });

  it("AC-037: the displayed result uses a dot decimal separator and no locale grouping", () => {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1234.5" } });

    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toContain(".");
    expect(result.value).not.toContain(",");
  });

  it("AC-037: labels are English only", () => {
    render(<Screen />);
    expect(screen.getByRole("heading", { name: "Converter" })).toBeTruthy();
    expect(screen.getByText("kilometre")).toBeTruthy();
    expect(screen.getByText("mile")).toBeTruthy();
  });

  it("AC-038: a comma is not accepted as a decimal separator (single format)", () => {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1,5" } });

    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("");
  });

  it("AC-038: there is no language or number-format setting", () => {
    render(<Screen />);
    expect(screen.queryByText(/language/i)).toBeNull();
    expect(screen.queryByText(/number format/i)).toBeNull();
    expect(screen.queryByText(/locale/i)).toBeNull();
    expect(screen.queryByLabelText(/language|number format|locale/i)).toBeNull();
    // No select/combobox controls exist on the screen at all.
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
