import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

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

describe("Converter — US-008 select source and target units", () => {
  // The From and To rows each render the full set of unit buttons, so scope
  // every selection to its row. The label span ('From' / 'To') sits in a
  // header div; its parent is the row that also holds the unit buttons.
  function rowFor(label: string): HTMLElement {
    const header = screen.getByText(label).closest("div");
    if (!header || !header.parentElement) {
      throw new Error("Could not locate the " + label + " unit row");
    }
    return header.parentElement as HTMLElement;
  }

  it("AC-022: converts the entered value from the chosen source unit to the chosen target unit", () => {
    render(<Screen />);

    // Choose source = mile, target = kilometre within the correct rows.
    fireEvent.click(within(rowFor("From")).getByRole("button", { name: "mi" }));
    fireEvent.click(within(rowFor("To")).getByRole("button", { name: "km" }));

    // Selectors drive the input/result labelling.
    const value = screen.getByLabelText("Value in mile") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1" } });

    // 1 mi -> km = 1 * 1609.344 / 1000 = 1.609344 -> 1.60934 (6 sig figs)
    const result = screen.getByLabelText("Result in kilometre") as HTMLInputElement;
    expect(result.value).toBe("1.60934");
  });

  it("AC-022: swapping the source unit alone re-derives the result", () => {
    render(<Screen />);

    // Defaults: km -> mi. Enter a value first, then change only the source.
    const kmInput = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(kmInput, { target: { value: "1000" } });
    expect((screen.getByLabelText("Result in mile") as HTMLInputElement).value).toBe("621.371");

    // Change source to metre; the same typed digits now mean 1000 m.
    fireEvent.click(within(rowFor("From")).getByRole("button", { name: "m" }));
    // 1000 m -> mi = 1000 / 1609.344 = 0.621371 (6 sig figs)
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("0.621371");
  });

  it("AC-023: identical source and target return the entered value with no error", () => {
    render(<Screen />);

    // Set target to the same unit as the default source (kilometre).
    fireEvent.click(within(rowFor("To")).getByRole("button", { name: "km" }));

    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "42.5" } });

    const result = screen.getByLabelText("Result in kilometre") as HTMLInputElement;
    expect(result.value).toBe("42.5");

    // No error surfaced anywhere on the screen.
    expect(screen.queryByText(/error|invalid/i)).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("AC-024: each unit option shows a standard symbol and an unambiguous English name", () => {
    render(<Screen />);

    const from = rowFor("From");

    const km = within(from).getByRole("button", { name: "km" });
    expect(km).toHaveTextContent("km");
    expect(km.getAttribute("title")).toBe("kilometre");

    const mi = within(from).getByRole("button", { name: "mi" });
    expect(mi).toHaveTextContent("mi");
    expect(mi.getAttribute("title")).toBe("mile");

    // The selected unit's English name is shown in the row header.
    expect(within(from).getByText("kilometre")).toBeTruthy();

    // Every option in the row carries both a visible symbol and an English name.
    const options = within(from).getAllByRole("button");
    options.forEach(function (btn) {
      expect((btn.textContent || "").trim().length).toBeGreaterThan(0);
      expect((btn.getAttribute("title") || "").trim().length).toBeGreaterThan(0);
    });
  });
});
