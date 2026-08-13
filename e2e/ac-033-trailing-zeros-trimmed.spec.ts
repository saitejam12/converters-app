import { expect, test } from '@playwright/test';

import { enterValue, gotoConverter, pickUnit } from './support/converter';

test.describe('AC-033: trailing zeros are trimmed', () => {
  test('a result of 2.500000 reads as 2.5', async ({ page }) => {
    await gotoConverter(page);

    await pickUnit(page, 'To', 'm');
    await enterValue(page, 'kilometre', '0.0025');

    await expect(page.getByLabel('Result in metre')).toHaveValue('2.5');
  });

  test('a result of 5.000000 reads as 5', async ({ page }) => {
    await gotoConverter(page);

    await pickUnit(page, 'To', 'm');
    await enterValue(page, 'kilometre', '0.005');

    await expect(page.getByLabel('Result in metre')).toHaveValue('5');
  });

  test('a whole-number conversion carries no decimal point at all', async ({ page }) => {
    await gotoConverter(page);

    await pickUnit(page, 'From', 'm');
    await pickUnit(page, 'To', 'cm');
    await enterValue(page, 'metre', '3');

    await expect(page.getByLabel('Result in centimetre')).toHaveValue('300');
  });
});
