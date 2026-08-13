import { test } from '@playwright/test';

import {
  expectMatchesReference,
  gotoConverter,
  readResult,
  selectCategory,
  setValue
} from './support/converter';

/**
 * AC-025: every ratio category converts from a factor table bundled in the
 * application source, with no request to any external service. Each reference
 * below is derived from the published definition of the unit, not read back
 * out of the app.
 */
const RATIO_CONVERSIONS = [
  { category: 'Length', input: '1', reference: 1000 / 1609.344, what: '1 km in miles' },
  { category: 'Weight', input: '1', reference: 1 / 0.45359237, what: '1 kg in pounds' },
  { category: 'Volume', input: '1', reference: 1 / 3.785411784, what: '1 litre in US gallons' },
  { category: 'Area', input: '1', reference: 1 / 0.09290304, what: '1 square metre in square feet' },
  { category: 'Speed', input: '1', reference: 1 / 3.6 / 0.44704, what: '1 km/h in mph' },
  { category: 'Time', input: '1', reference: 60, what: '1 hour in minutes' },
  { category: 'Data', input: '1', reference: 1000, what: '1 GB in MB' }
];

test.describe('AC-025 ratio conversions come from the bundled factor tables', () => {
  test('every ratio category converts correctly with the network switched off', async ({
    page,
    context
  }) => {
    await gotoConverter(page);

    // Nothing may reach the app from here on: the factors have to be in the bundle.
    await context.setOffline(true);

    try {
      for (const conversion of RATIO_CONVERSIONS) {
        await selectCategory(page, conversion.category);
        await setValue(page, conversion.input);
        expectMatchesReference(await readResult(page), conversion.reference, conversion.what);
      }
    } finally {
      await context.setOffline(false);
    }
  });

  test('a value entered offline is converted on every keystroke', async ({ page, context }) => {
    await gotoConverter(page);
    await context.setOffline(true);

    try {
      await selectCategory(page, 'Length');
      await setValue(page, '2');
      expectMatchesReference(await readResult(page), 2000 / 1609.344, '2 km in miles');

      await setValue(page, '26.2');
      expectMatchesReference(await readResult(page), 26200 / 1609.344, '26.2 km in miles');
    } finally {
      await context.setOffline(false);
    }
  });
});
