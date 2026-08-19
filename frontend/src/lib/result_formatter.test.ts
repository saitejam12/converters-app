import { describe, it, expect } from "vitest";

import { formatResult, DECIMAL_SEPARATOR } from "./result_formatter";

describe("formatResult", () => {
  it("fixes the decimal separator as a dot", () => {
    expect(DECIMAL_SEPARATOR).toBe(".");
  });

  it("returns an empty string for non-finite input", () => {
    expect(formatResult(NaN)).toBe("");
    expect(formatResult(Infinity)).toBe("");
    expect(formatResult(-Infinity)).toBe("");
  });

  it("formats zero as '0'", () => {
    expect(formatResult(0)).toBe("0");
  });

  it("uses a dot as the decimal separator, never a comma", () => {
    expect(formatResult(1234.5)).toBe("1234.5");
    expect(formatResult(1234.5)).not.toContain(",");
    expect(formatResult(0.621371192)).toBe("0.621371");
  });

  it("trims trailing zeros", () => {
    expect(formatResult(1.5)).toBe("1.5");
    expect(formatResult(2)).toBe("2");
  });

  it("limits to six significant figures", () => {
    expect(formatResult(1.234567)).toBe("1.23457");
  });

  it("uses exponential notation with a dot for very large magnitudes", () => {
    const s = formatResult(1.5e12);
    expect(s).toBe("1.5e+12");
    expect(s).toContain("e");
    expect(s).not.toContain(",");
  });

  it("uses exponential notation for very small magnitudes", () => {
    expect(formatResult(0.0000001)).toBe("1e-7");
  });
});
