import { expect, test } from '@playwright/test';

import { expectOffersUnit, gotoConverter, selectCategory } from './helpers/converter';

/**
 * AC-018: Given the length/distance category is selected, when I open a unit
 * selector, then it offers at least mm, cm, m, km, inch, foot, yard and mile.
 */
test.describe('AC-018 length unit selector', () => {
  test('offers mm, cm, m, km, inch, foot, yard and mile', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Length');

    for (const symbol of ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi']) {
      await expectOffersUnit(page, symbol);
    }
  });

  test('names each unit in full so an unfamiliar symbol can be read', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Length');

    const names: Array<[string, string]> = [
      ['mm', 'millimetre'],
      ['cm', 'centimetre'],
      ['m', 'metre'],
      ['km', 'kilometre'],
      ['in', 'inch'],
      ['ft', 'foot'],
      ['yd', 'yard'],
      ['mi', 'mile']
    ];

    for (const [symbol, name] of names) {
      await expect(
        page.getByRole('button', { name: symbol, exact: true }).first()
      ).toHaveAttribute('title', name);
    }
  });

  test('lets me pick a unit from the list and convert with it', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Length');

    await page.getByRole('button', { name: 'm', exact: true }).first().click();
    await page.getByRole('button', { name: 'ft', exact: true }).last().click();

    await page.getByLabel('Value in metre').fill('2');

    const result = page.getByLabel('Result in foot');
    await expect(result).toHaveValue(/\d/);
    expect(Number(await result.inputValue())).toBeCloseTo(6.56168, 3);
  });
});
