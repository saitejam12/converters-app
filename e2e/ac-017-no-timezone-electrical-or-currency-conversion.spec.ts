import { expect, test } from "@playwright/test";

import { CATEGORY_PATTERNS, FORBIDDEN_PATTERNS, categoryButtons, gotoConverter, selectCategory } from "./converter.helpers";

test.describe("AC-017 no time-zone, electrical or currency conversion exists", function () {
  test("the category selector offers none of them", async function ({ page }) {
    await gotoConverter(page);

    const labels = (await categoryButtons(page).allTextContents()).map(function (t) {
      return t.trim();
    });

    for (const label of labels) {
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(label), 'category "' + label + '" matched ' + pattern).toBe(false);
      }
    }
  });

  test("none of them appear anywhere in the app, in any category", async function ({ page }) {
    await gotoConverter(page);

    for (const spec of CATEGORY_PATTERNS) {
      await selectCategory(page, spec.match);
      // innerHTML so unit titles and aria-labels are covered, not just visible text.
      const markup = await page.locator("body").innerHTML();
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(pattern.test(markup), "found " + pattern + " while " + spec.name + " was selected").toBe(false);
      }
    }
  });
});
