import { expect, test } from '@playwright/test';

import {
  CATEGORY_UNITS,
  DATA_UNIT_SYMBOLS,
  gotoConverter,
  selectCategory,
  unitChips
} from './helpers/converter';

/**
 * AC-021: Given the digital data storage category exists, when the requirement
 * is reviewed, then it is flagged as an analyst-added category not present in
 * the original brief, and can be removed without affecting any other requirement.
 *
 * The "flagged" half is documentation and is asserted in
 * frontend/src/lib/units/docs.test.ts. What is provable in the running app is
 * that nothing else depends on the category: it is not the landing category, no
 * other category offers its units, and every other flow works without it.
 */
test.describe('AC-021 the data category is self-contained', () => {
  test('exists as its own category and is not the one the app opens on', async ({ page }) => {
    await gotoConverter(page);

    const dataTab = page.getByRole('button', { name: 'Data', exact: true });
    await expect(dataTab).toBeVisible();
    await expect(dataTab).toHaveAttribute('aria-pressed', 'false');

    await expect(page.getByRole('button', { name: 'Length', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('no other category offers a digital data unit', async ({ page }) => {
    await gotoConverter(page);

    for (const { tab } of CATEGORY_UNITS.filter((c) => c.tab !== 'Data')) {
      await selectCategory(page, tab);

      const symbols = await unitChips(page).evaluateAll((nodes) =>
        nodes.map((node) => (node.textContent ?? '').trim())
      );

      for (const dataSymbol of DATA_UNIT_SYMBOLS) {
        expect(symbols, tab + ' offers the data unit ' + dataSymbol).not.toContain(dataSymbol);
      }
    }
  });

  test('another category converts correctly without the data category being touched', async ({
    page
  }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Weight');

    await page.getByRole('button', { name: 'kg', exact: true }).first().click();
    await page.getByRole('button', { name: 'lb', exact: true }).last().click();
    await page.getByLabel('Value in kilogram').fill('10');

    const result = page.getByLabel('Result in pound');
    await expect(result).toHaveValue(/\d/);
    expect(Number(await result.inputValue())).toBeCloseTo(22.0462, 3);
  });

  test('converting in the data category works on its own terms', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Data');

    await page.getByRole('button', { name: 'GB', exact: true }).first().click();
    await page.getByRole('button', { name: 'MB', exact: true }).last().click();
    await page.getByLabel('Value in gigabyte (decimal)').fill('2');

    const result = page.getByLabel('Result in megabyte (decimal)');
    expect(Number(await result.inputValue())).toBeCloseTo(2000, 0);
  });
});
