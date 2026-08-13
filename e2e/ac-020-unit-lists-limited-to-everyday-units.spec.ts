import { expect, test } from '@playwright/test';

import { CATEGORY_UNITS, gotoConverter, selectCategory, unitChips } from './helpers/converter';

/**
 * AC-020: Given any category is selected, when I review its unit list, then the
 * list is limited to common everyday units and excludes exhaustive scientific or
 * historical units.
 *
 * Analyst assumption: the exclusion list below is the one recorded in
 * frontend/src/lib/units/README.md. If one of these is deliberately added later,
 * it comes out of this list too.
 */
const OBSCURE =
  /furlong|fathom|light[- ]?year|parsec|angstrom|\bslug\b|\bdram\b|hogshead|firkin|\brood\b|rankine|r[eé]aumur|cubit|league|barleycorn|scruple|pennyweight/i;

test.describe('AC-020 everyday units only', () => {
  for (const { tab, symbols } of CATEGORY_UNITS) {
    test('the ' + tab + ' list is short and free of obscure units', async ({ page }) => {
      await gotoConverter(page);
      await selectCategory(page, tab);

      const chips = unitChips(page);
      const count = await chips.count();

      // Two selectors on screen, so an even count, at most nine units each.
      expect(count % 2).toBe(0);
      expect(count / 2).toBeGreaterThanOrEqual(symbols.length);
      expect(count / 2).toBeLessThanOrEqual(9);

      const titles = await chips.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('title') ?? '')
      );
      for (const title of titles) {
        expect(title, tab + ' offers ' + title).not.toMatch(OBSCURE);
      }
    });
  }

  test('the time list stops at the week: no month or year', async ({ page }) => {
    await gotoConverter(page);
    await selectCategory(page, 'Time');

    const titles = await unitChips(page).evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('title') ?? '')
    );

    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title).not.toMatch(/month|year/i);
    }
  });
});
