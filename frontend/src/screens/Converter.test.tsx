import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Screen from "./Converter";

describe("Converter number format (US-012)", () => {
  it("shows an empty result before any value is entered", () => {
    render(<Screen />);
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("");
  });

  it("accepts a dot decimal separator and converts correctly (AC-036)", () => {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "2.5" } });
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("1.55343");
  });

  it("displays results with a dot as the decimal separator, never a comma (AC-037)", () => {
    render(<Screen />);
    const value = screen.getByLabelText("Value in kilometre") as HTMLInputElement;
    fireEvent.change(value, { target: { value: "1" } });
    const result = screen.getByLabelText("Result in mile") as HTMLInputElement;
    expect(result.value).toBe("0.621371");
    expect(result.value).not.toContain(",");
  });

  it("offers no language or number-format setting (AC-038)", () => {
    render(<Screen />);
    expect(screen.queryByText(/language/i)).toBeNull();
    expect(screen.queryByText(/number format/i)).toBeNull();
    // No select / combobox controls exist anywhere on the screen.
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
