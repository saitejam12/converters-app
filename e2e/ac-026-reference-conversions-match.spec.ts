import { test } from '@playwright/test';

import {
  expectMatchesReference,
  gotoConverter,
  readResult,
  selectCategory,
  selectUnit,
  setValue
} from './support/converter';

/** AC-026: the known reference conversions, to the precision the app displays. */
const REFERENCES = [
  {
    title: '1 mile = 1.609344 km',
    category: 'Length',
    from: 'mi',
    to: 'km',
    input: '1',
    reference: 1.609344
  },
  {
    title: '1 lb = 0.45359237 kg',
    category: 'Weight',
    from: 'lb',
    to: 'kg',
    input: '1',
    reference: 0.45359237
  },
  {
    title: '1 gallon (US) = 3.785411784 l',
    category: 'Volume',
    from: 'gal',
    to: 'l',
    input: '1',
    reference: 3.785411784
  },
  {
    title: '1 acre = 4046.8564224 sq m',
    category: 'Area',
    from: 'acre',
    to: 'm²',
    input: '1',
    reference: 4046.8564224
  }
];

test.describe('AC-026 reference conversions match to the displayed precision', () => {
  for (const reference of REFERENCES) {
    test(reference.title, async ({ page }) => {
      await gotoConverter(page);

      await selectCategory(page, reference.category);
      await selectUnit(page, 'from', reference.from);
      await selectUnit(page, 'to', reference.to);
      await setValue(page, reference.input);

      expectMatchesReference(await readResult(page), reference.reference, reference.title);
    });
  }

  test('1.609344 km converts back to exactly 1 mile', async ({ page }) => {
    await gotoConverter(page);

    await selectCategory(page, 'Length');
    await selectUnit(page, 'from', 'km');
    await selectUnit(page, 'to', 'mi');
    await setValue(page, '1.609344');

    expectMatchesReference(await readResult(page), 1, '1.609344 km in miles');
  });
});
