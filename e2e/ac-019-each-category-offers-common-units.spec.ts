import { expect, test } from '@playwright/test';

import { CATEGORY_UNITS, expectOffersUnit, gotoConverter, selectCategory } from './helpers/converter';

/**
 * AC-019: Given the weight/mass, volume, area, speed, time and data categories
 * are each selected in turn, when I open a unit selector, then each offers a
 * documented list of common metric and US/imperial units for that category.
 */
test.describe('AC-019 common units per category', () => {
  for (const { tab, symbols } of CATEGORY_UNITS) {
    test('the ' + tab + ' selector offers ' + symbols.join(', '), async ({ page }) => {
      await gotoConverter(page);
      await selectCategory(page, tab);

      for (const symbol of symbols) {
        await expectOffersUnit(page, symbol);
      }
    });
  }

  test('volume spoon, cup and gallon measures say they are US', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Volume');

    for (const symbol of ['tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal']) {
      await expect(
        page.getByRole('button', { name: symbol, exact: true }).first()
      ).toHaveAttribute('title', /\(US\)/);
    }
  });

  test('data units state their decimal or binary basis', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Data');

    for (const symbol of ['KB', 'MB', 'GB', 'TB']) {
      await expect(
        page.getByRole('button', { name: symbol, exact: true }).first()
      ).toHaveAttribute('title', /decimal/i);
    }

    for (const symbol of ['KiB', 'MiB', 'GiB']) {
      await expectOffersUnit(page, symbol);
      await expect(
        page.getByRole('button', { name: symbol, exact: true }).first()
      ).toHaveAttribute('title', /binary/i);
    }
  });
});
