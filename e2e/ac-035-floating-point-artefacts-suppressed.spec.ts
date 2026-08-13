import { expect, test } from '@playwright/test';

import { enterValue, gotoConverter, pickCategory, pickUnit } from './support/converter';

test.describe('AC-035: double-precision rounding artefacts are suppressed in the displayed value', () => {
  test('0.1 litre in millilitres reads 100, not 100.00000000000001', async ({ page }) => {
    await gotoConverter(page);

    await pickCategory(page, 'Volume');
    await pickUnit(page, 'To', 'ml');
    await enterValue(page, 'litre', '0.1');

    const result = page.getByLabel('Result in millilitre');
    await expect(result).toHaveValue('100');
    await expect(result).not.toHaveValue('100.00000000000001');
  });

  test('a temperature round trip does not leak an artefact', async ({ page }) => {
    await gotoConverter(page);

    await pickCategory(page, 'Temp');
    await pickUnit(page, 'From', '°F');
    await pickUnit(page, 'To', '°C');
    await enterValue(page, 'Fahrenheit', '98.6');

    // (98.6 - 32) * 5 / 9 = 37.00000000000001 in double precision.
    const result = page.getByLabel('Result in Celsius');
    await expect(result).toHaveValue('37');
    await expect(result).not.toHaveValue(/0000000/);
  });

  test('a chained ounce to pound conversion reads as a tidy number', async ({ page }) => {
    await gotoConverter(page);

    await pickCategory(page, 'Weight');
    await pickUnit(page, 'From', 'oz');
    await pickUnit(page, 'To', 'lb');
    await enterValue(page, 'ounce', '16');

    await expect(page.getByLabel('Result in pound')).toHaveValue('1');
  });
});
