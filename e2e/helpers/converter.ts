import { expect, type Page } from '@playwright/test';

/**
 * Shared navigation and expectations for the US-007 acceptance specs.
 *
 * The unit lists here are written out from the acceptance criteria on purpose:
 * these specs are the specification, not a mirror of the registry.
 */

export async function gotoConverter(page: Page): Promise<void> {
  const heading = page.getByRole('heading', { name: 'Converter', level: 1 });

  await page.goto('/converter');
  try {
    await heading.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    await page.goto('/');
  }

  await expect(heading).toBeVisible();
}

export async function selectCategory(page: Page, tab: string): Promise<void> {
  const button = page.getByRole('button', { name: tab, exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
}

/** Every unit chip carries the spelled-out unit name as its tooltip. */
export function unitChips(page: Page) {
  return page.locator('button[title]');
}

export async function expectOffersUnit(page: Page, symbol: string): Promise<void> {
  const chips = page.getByRole('button', { name: symbol, exact: true });
  // One chip in the "From" selector, one in the "To" selector.
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toBeVisible();
}

export const CATEGORY_UNITS: ReadonlyArray<{ tab: string; symbols: string[] }> = [
  { tab: 'Length', symbols: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'] },
  { tab: 'Weight', symbols: ['g', 'kg', 't', 'oz', 'lb', 'st'] },
  { tab: 'Volume', symbols: ['ml', 'l', 'tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal'] },
  { tab: 'Temp', symbols: ['°C', '°F', 'K'] },
  { tab: 'Area', symbols: ['m²', 'km²', 'ha', 'ft²', 'yd²', 'acre', 'mi²'] },
  { tab: 'Speed', symbols: ['m/s', 'km/h', 'mph', 'kn'] },
  { tab: 'Time', symbols: ['ms', 's', 'min', 'h', 'd', 'wk'] },
  { tab: 'Data', symbols: ['B', 'KB', 'MB', 'GB', 'TB'] }
];

export const DATA_UNIT_SYMBOLS = ['B', 'KB', 'MB', 'GB', 'TB', 'KiB', 'MiB', 'GiB'];
