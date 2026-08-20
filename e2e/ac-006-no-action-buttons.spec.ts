import { test, expect } from "@playwright/test";

// AC-006: on the converter screen there is no submit, convert, swap or copy
// button — conversion is triggered solely by input and selection changes.
test("AC-006: no submit, convert, swap or copy button exists", async ({ page }) => {
  await page.goto("/");

  // The converter screen is displayed.
  await expect(page.getByRole("heading", { name: "Converter" })).toBeVisible();

  await expect(page.getByRole("button", { name: /submit/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /convert/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /swap/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0);

  await expect(page.locator('button[type="submit"]')).toHaveCount(0);
  await expect(page.locator("form")).toHaveCount(0);
});
