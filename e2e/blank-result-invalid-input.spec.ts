import { test, expect } from "@playwright/test";

// US-003 — Blank result for empty or invalid input.
// Each spec is named after the acceptance criterion it proves and drives the
// converter screen the way a person mid-typing would.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // The default category is Length (km -> mi).
  await expect(page.getByRole("heading", { name: "Converter" })).toBeVisible();
});

test("AC-007: empty input keeps the result blank with no error", async ({ page }) => {
  const result = page.getByLabel("Result in mile");

  await expect(result).toHaveValue("");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("AC-008: unparseable input keeps the result blank with no error", async ({ page }) => {
  const value = page.getByLabel("Value in kilometre");
  const result = page.getByLabel("Result in mile");

  for (const bad of ["-", ".", "abc", "1.2.3"]) {
    await value.fill(bad);
    await expect(result).toHaveValue("");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("AC-009: correcting invalid input to a valid number shows the result immediately", async ({ page }) => {
  const value = page.getByLabel("Value in kilometre");
  const result = page.getByLabel("Result in mile");

  await value.fill("abc");
  await expect(result).toHaveValue("");

  await value.fill("2");
  // 2 km -> mi = 2 * 1000 / 1609.344 = 1.24274 (6 sig figs)
  await expect(result).toHaveValue("1.24274");
});
