import { test, expect } from "@playwright/test";

// US-010 — temperature conversion with offset formulas, driven end-to-end
// through the Converter screen the way a user would.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Temp" }).click();
});

test("AC-028: converting 0 °C to Fahrenheit gives 32", async ({ page }) => {
  await page.getByLabel("Value in Celsius").fill("0");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("32");
});

test("AC-029: 100 °C to Fahrenheit gives 212", async ({ page }) => {
  await page.getByLabel("Value in Celsius").fill("100");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("212");
});

test("AC-029: 0 °C to Kelvin gives 273.15", async ({ page }) => {
  await page.getByTitle("Kelvin").last().click();
  await page.getByLabel("Value in Celsius").fill("0");
  await expect(page.getByLabel("Result in Kelvin")).toHaveValue("273.15");
});

test("AC-029: -40 °C to Fahrenheit gives -40", async ({ page }) => {
  await page.getByLabel("Value in Celsius").fill("-40");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("-40");
});

test("AC-030: -273.15 °C to Kelvin gives 0 with negative input accepted, no error", async ({ page }) => {
  await page.getByTitle("Kelvin").last().click();
  await page.getByLabel("Value in Celsius").fill("-273.15");
  await expect(page.getByLabel("Result in Kelvin")).toHaveValue("0");
  await expect(page.getByText(/error|invalid|range|absolute zero/i)).toHaveCount(0);
});

test("AC-031: temperature uses an offset, not a single ratio through the origin", async ({ page }) => {
  // A ratio-only conversion would map 0 -> 0; the offset maps 0 °C -> 32 °F.
  await page.getByLabel("Value in Celsius").fill("0");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("32");
  // Doubling the input does not double the output when an offset is applied.
  await page.getByLabel("Value in Celsius").fill("10");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("50");
  await page.getByLabel("Value in Celsius").fill("20");
  await expect(page.getByLabel("Result in Fahrenheit")).toHaveValue("68");
});
