import { expect, test } from "@playwright/test";

import { CATEGORY_PATTERNS, categoryButtons, gotoConverter } from "./converter.helpers";

test.describe("AC-014 the category selector offers exactly eight categories", function () {
  test("length, weight, volume, temperature, area, speed, time and data are all offered, and nothing else", async function ({ page }) {
    await gotoConverter(page);

    const buttons = categoryButtons(page);
    await expect(buttons).toHaveCount(8);

    const labels = (await buttons.allTextContents()).map(function (t) {
      return t.trim();
    });

    for (const spec of CATEGORY_PATTERNS) {
      const matches = labels.filter(function (label) {
        return spec.match.test(label);
      });
      expect(matches, "expected exactly one category for " + spec.name + ", saw " + labels.join(", ")).toHaveLength(1);
    }
  });

  test("every offered category can be selected", async function ({ page }) {
    await gotoConverter(page);

    for (const spec of CATEGORY_PATTERNS) {
      await categoryButtons(page).filter({ hasText: spec.match }).click();
      await expect(categoryButtons(page).filter({ hasText: spec.match })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('nav[aria-label="Measurement category"] button[aria-pressed="true"]')).toHaveCount(1);
    }
  });
});
