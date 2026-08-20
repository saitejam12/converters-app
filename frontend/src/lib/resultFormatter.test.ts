import { describe, it, expect } from "vitest";

import { formatResult } from "@/lib/resultFormatter";

describe("formatResult", () => {
  it("returns an empty string for non-finite values", () => {
    expect(formatResult(NaN)).toBe("");
    expect(formatResult(Infinity)).toBe("");
    expect(formatResult(-Infinity)).toBe("");
  });

  it("returns '0' for zero", () => {
    expect(formatResult(0)).toBe("0");
  });

  it("uses a dot as the decimal separator (AC-037)", () => {
    const s = formatResult(0.621371);
    expect(s).toContain(".");
    expect(s).not.toContain(",");
  });

  it("limits to ~6 significant figures and trims trailing zeros", () => {
    expect(formatResult(0.9320567)).toBe("0.932057");
    expect(formatResult(1.5)).toBe("1.5");
    expect(formatResult(100)).toBe("100");
  });

  it("falls back to exponential notation for very large magnitudes with a dot", () => {
    const s = formatResult(1234567890);
    expect(s).toMatch(/e/);
    expect(s).toContain(".");
    expect(s).not.toContain(",");
  });

  it("falls back to exponential notation for very small magnitudes with a dot", () => {
    const s = formatResult(0.0000001);
    expect(s).toMatch(/e/);
    expect(s).toContain(".");
  });

  it("never uses locale grouping or comma separators, whatever the value", () => {
    for (const n of [1000, 12345.6789, 999999999, 0.000123456]) {
      expect(formatResult(n)).not.toContain(",");
    }
  });
});
