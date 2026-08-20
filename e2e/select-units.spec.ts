import { test, expect } from "@playwright/test";

// US-008 — Select source and target units.
// The From row is rendered before the To row, so first()/last() disambiguate
// the two buttons that share a symbol.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("AC-022: result converts the entered value from source to target unit", async ({ page }) => {
  await page.getByRole("button", { name: "mi", exact: true }).first().click(); // source = mile
  await page.getByRole("button", { name: "km", exact: true }).last().click(); // target = kilometre

  await page.getByLabel("Value in mile").fill("1");

  // 1 mi = 1.609344 km -> 1.60934 at 6 significant figures.
  await expect(page.getByLabel("Result in kilometre")).toHaveValue("1.60934");
});

test("AC-023: same unit as source and target returns the entered value with no error", async ({ page }) => {
  await page.getByRole("button", { name: "km", exact: true }).last().click(); // target = kilometre (= default source)

  await page.getByLabel("Value in kilometre").fill("42.5");

  await expect(page.getByLabel("Result in kilometre")).toHaveValue("42.5");
  await expect(page.getByText(/error|invalid/i)).toHaveCount(0);
});

test("AC-024: unit options show a clear English name and standard symbol", async ({ page }) => {
  const kmFrom = page.getByRole("button", { name: "km", exact: true }).first();
  await expect(kmFrom).toHaveText("km");
  await expect(kmFrom).toHaveAttribute("title", "kilometre");

  const miTo = page.getByRole("button", { name: "mi", exact: true }).last();
  await expect(miTo).toHaveText("mi");
  await expect(miTo).toHaveAttribute("title", "mile");

  // The selected source unit's English name is visible.
  await expect(page.getByText("kilometre").first()).toBeVisible();
});
