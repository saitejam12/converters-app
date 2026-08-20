import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import Screen from "@/screens/Converter";

// US-005 — No stored or remembered state.
// These tests assert the two acceptance criteria the format tests do not reach:
// AC-012 (defaults restored on reload) and AC-013 (nothing written to storage).

afterEach(function () {
  cleanup();
  try { window.localStorage.clear(); } catch (e) { /* ignore */ }
  try { window.sessionStorage.clear(); } catch (e) { /* ignore */ }
});

describe("Converter — no stored or remembered state", function () {
  it("AC-012: a fresh mount returns to the default category, units, empty input and blank result after prior use", function () {
    const first = render(<Screen />);

    // Use the app: enter a value while on the default (length) category.
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "42.5" } });
    expect((screen.getByLabelText("Result in mile") as HTMLInputElement).value).not.toBe("");

    // Select a non-default category (Weight) and non-default units (gram -> ounce).
    fireEvent.click(screen.getByRole("button", { name: "Weight" }));
    fireEvent.click(screen.getByTitle("gram"));
    fireEvent.click(screen.getByTitle("ounce"));

    // Confirm the app really moved off the defaults.
    expect(screen.queryByLabelText("Value in kilometre")).toBeNull();
    expect(screen.getByLabelText("Value in gram")).toBeTruthy();

    // Simulate a reload / reopen: tear the app down and mount it again fresh.
    first.unmount();
    render(<Screen />);

    // Back to defaults: length category, kilometre -> mile.
    const reloadedValue = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    expect(reloadedValue.value).toBe("");
    expect((screen.getByLabelText("Result in mile") as HTMLInputElement).value).toBe("");
    // The previously chosen weight units are gone.
    expect(screen.queryByLabelText("Value in gram")).toBeNull();
  });

  it("AC-013: using the app writes nothing to localStorage, sessionStorage or cookies", function () {
    const setLocal = vi.spyOn(Storage.prototype, "setItem");

    window.localStorage.clear();
    window.sessionStorage.clear();

    render(<Screen />);

    // Exercise the app: input, category change and unit changes.
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1234.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Weight" }));
    fireEvent.click(screen.getByTitle("pound"));
    fireEvent.click(screen.getByRole("button", { name: "Temp" }));

    // No storage writes of any kind.
    expect(setLocal).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe("");

    setLocal.mockRestore();
  });
});
