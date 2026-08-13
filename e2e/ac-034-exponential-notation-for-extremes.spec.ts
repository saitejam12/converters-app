import { expect, test } from '@playwright/test';

import { enterValue, gotoConverter, pickCategory, pickUnit } from './support/converter';

test.describe('AC-034: very large or very small magnitudes fall back to exponential notation', () => {
  test('1 byte in terabytes reads 1e-12 rather than a run of leading zeros', async ({ page }) => {
    await gotoConverter(page);

    await pickCategory(page, 'Data');
    await pickUnit(page, 'From', 'B');
    await pickUnit(page, 'To', 'TB');
    await enterValue(page, 'byte', '1');

    await expect(page.getByLabel('Result in terabyte (decimal)')).toHaveValue('1e-12');
  });

  test('1 terabyte in bytes reads 1e+12 rather than a run of trailing zeros', async ({ page }) => {
    await gotoConverter(page);

    await pickCategory(page, 'Data');
    await pickUnit(page, 'From', 'TB');
    await pickUnit(page, 'To', 'B');
    await enterValue(page, 'terabyte (decimal)', '1');

    await expect(page.getByLabel('Result in byte')).toHaveValue('1e+12');
  });

  test('an ordinary magnitude stays in plain decimal notation', async ({ page }) => {
    await gotoConverter(page);

    await pickUnit(page, 'From', 'mi');
    await pickUnit(page, 'To', 'mm');
    await enterValue(page, 'mile', '1');

    const result = page.getByLabel('Result in millimetre');
    await expect(result).toHaveValue('1609340');
    await expect(result).not.toHaveValue(/e/);
  });
});
