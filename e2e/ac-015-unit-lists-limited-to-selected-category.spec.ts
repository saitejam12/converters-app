import { expect, test } from "@playwright/test";

import { gotoConverter, offeredUnitSymbols, selectCategory, selectedUnitTitles, unitButtons } from "./converter.helpers";

const LENGTH_UNITS = ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"];
const TEMPERATURE_UNITS = ["°C", "°F", "K"];
const FOREIGN_UNITS = ["km", "kg", "gal", "GB", "mph", "acre", "min"];

test.describe("AC-015 unit selectors list only the selected category's units", function () {
  test("the source and target selectors both offer exactly the selected category's units", async function ({ page }) {
    await gotoConverter(page);

    await selectCategory(page, /length|distance/i);
    let offered = await offeredUnitSymbols(page);
    expect(offered.source).toEqual(LENGTH_UNITS);
    expect(offered.target).toEqual(LENGTH_UNITS);

    await selectCategory(page, /temp/i);
    offered = await offeredUnitSymbols(page);
    expect(offered.source).toEqual(TEMPERATURE_UNITS);
    expect(offered.target).toEqual(TEMPERATURE_UNITS);
  });

  test("a unit from another category cannot be chosen", async function ({ page }) {
    await gotoConverter(page);

    await selectCategory(page, /temp/i);

    // Nothing foreign is rendered, so there is nothing foreign to click.
    for (const foreign of FOREIGN_UNITS) {
      await expect(unitButtons(page).filter({ hasText: new RegExp("^" + foreign + "$") })).toHaveCount(0);
    }
    await expect(page.locator('button[title="kilometre"]')).toHaveCount(0);
    await expect(page.locator('button[title="pound"]')).toHaveCount(0);
  });

  test("the units actually chosen belong to the selected category", async function ({ page }) {
    await gotoConverter(page);

    await selectCategory(page, /data|storage/i);
    await unitButtons(page).filter({ hasText: /^MiB$/ }).nth(0).click();
    await unitButtons(page).filter({ hasText: /^KB$/ }).nth(1).click();

    const [source, target] = await selectedUnitTitles(page);
    expect(source).toMatch(/mebibyte/i);
    expect(target).toMatch(/kilobyte/i);

    await expect(page.getByLabel(/^Value in .*mebibyte/i)).toBeVisible();
    await expect(page.getByLabel(/^Result in .*kilobyte/i)).toBeVisible();
  });
});
