import { expect, test } from "@playwright/test";

import {
  CATEGORY_PATTERNS,
  gotoConverter,
  offeredUnitSymbols,
  resultField,
  resultNumber,
  selectCategory,
  selectedUnitTitles,
  unitButtons,
  valueField
} from "./converter.helpers";

test.describe("AC-016 switching category resets the unit selectors and recalculates", function () {
  test("the selectors return to the new category's defaults instead of keeping the old choice", async function ({ page }) {
    await gotoConverter(page);

    const [defaultSource, defaultTarget] = await selectedUnitTitles(page);

    await unitButtons(page).filter({ hasText: /^m$/ }).nth(0).click();
    await unitButtons(page).filter({ hasText: /^ft$/ }).nth(1).click();
    expect(await selectedUnitTitles(page)).toEqual(["metre", "foot"]);

    await selectCategory(page, /weight|mass/i);
    const weightUnits = (await offeredUnitSymbols(page)).source;
    const [weightSource, weightTarget] = await selectedUnitTitles(page);
    expect(weightSource).not.toBe("metre");
    expect(weightTarget).not.toBe("foot");
    expect(weightUnits).toContain("kg");

    await selectCategory(page, /length|distance/i);
    expect(await selectedUnitTitles(page)).toEqual([defaultSource, defaultTarget]);
  });

  test("the result recalculates for the new category with the entered value kept", async function ({ page }) {
    await gotoConverter(page);

    await valueField(page).fill("10");
    const lengthResult = await resultNumber(page);
    expect(lengthResult).toBeCloseTo(6.21371, 4); // 10 km in miles

    await selectCategory(page, /weight|mass/i);
    await expect(valueField(page)).toHaveValue("10");
    const weightResult = await resultNumber(page);
    expect(weightResult).toBeCloseTo(22.0462, 3); // 10 kg in pounds
    expect(weightResult).not.toBeCloseTo(lengthResult, 4);

    await selectCategory(page, /temp/i);
    expect(await resultNumber(page)).toBeCloseTo(50, 6); // 10 °C in °F

    expect(await resultField(page).inputValue()).not.toMatch(/nan|infinity|error/i);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("the result blanks with no error when the input is empty", async function ({ page }) {
    await gotoConverter(page);

    await valueField(page).fill("10");
    await expect(resultField(page)).not.toHaveValue("");

    await valueField(page).fill("");
    await expect(resultField(page)).toHaveValue("");

    for (const spec of CATEGORY_PATTERNS) {
      await selectCategory(page, spec.match);
      await expect(resultField(page), "empty input should blank the result in " + spec.name).toHaveValue("");
    }

    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(await page.locator("body").innerText()).not.toMatch(/nan|infinity|error/i);
  });
});
