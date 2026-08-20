import { test, expect } from "@playwright/test";

// AC-004: with a category, source and target unit selected, typing each
// character of a numeric value updates the read-only result after every
// keystroke to reflect the value typed so far.
test("AC-004: result updates after every keystroke", async ({ page }) => {
  await page.goto("/");

  const value = page.getByLabel("Value in kilometre");
  const result = page.getByLabel("Result in mile");

  await expect(result).toHaveValue("");

  await value.click();

  await value.pressSequentially("1");
  // 1 km -> mi = 1000 / 1609.344 = 0.621371
  await expect(result).toHaveValue("0.621371");

  await value.pressSequentially("2");
  // 12 km -> mi = 12000 / 1609.344 = 7.45645
  await expect(result).toHaveValue("7.45645");

  await value.pressSequentially(".3");
  // 12.3 km -> mi = 12300 / 1609.344 = 7.64287
  await expect(result).toHaveValue("7.64287");
});
