import { expect, test } from '@playwright/test';

import { enterValue, gotoConverter, pickUnit } from './support/converter';

test.describe('AC-032: a result with many decimal places is shown to ~6 significant figures', () => {
  test('1 kilometre in miles reads 0.621371, not the full expansion', async ({ page }) => {
    await gotoConverter(page);

    await enterValue(page, 'kilometre', '1');

    const result = page.getByLabel('Result in mile');
    await expect(result).toHaveValue('0.621371');
    await expect(result).not.toHaveValue('0.6213711922373339');
  });

  test('a long mixed number is rounded to six figures', async ({ page }) => {
    await gotoConverter(page);

    await pickUnit(page, 'To', 'ft');
    await enterValue(page, 'kilometre', '1.23456789');

    // 1.23456789 km = 4050.42... ft
    await expect(page.getByLabel('Result in foot')).toHaveValue('4050.42');
  });

  test('the unit rate hint uses the same precision', async ({ page }) => {
    await gotoConverter(page);

    await enterValue(page, 'kilometre', '1');

    await expect(page.getByText('1 km = 0.621371 mi')).toBeVisible();
  });
});
