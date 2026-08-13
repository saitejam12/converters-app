import { expect, type Page } from '@playwright/test';

/**
 * Open the Converter screen (SCR-001, route 'converter').
 *
 * The app is a single-screen SPA; depending on how the router is mounted the
 * screen lives at /converter or at the root. Try the named route first and fall
 * back, so a spec only fails for a formatting reason.
 */
export async function gotoConverter(page: Page): Promise<void> {
  const heading = page.getByRole('heading', { name: 'Converter' });

  await page.goto('/converter');
  try {
    await heading.waitFor({ state: 'visible', timeout: 3000 });
    return;
  } catch {
    await page.goto('/');
  }

  await expect(heading).toBeVisible();
}

/** Pick a category from the bottom navigation, e.g. 'Data'. */
export async function pickCategory(page: Page, label: string): Promise<void> {
  await page.getByRole('button', { name: label, exact: true }).click();
}

/**
 * Pick a unit by symbol inside the From or To row. Both rows list every unit of
 * the category, so the click has to be scoped to the row that owns it.
 */
export async function pickUnit(page: Page, caption: 'From' | 'To', symbol: string): Promise<void> {
  const label = page.getByText(caption, { exact: true });
  const row = label.locator('xpath=../..');
  await row.getByRole('button', { name: symbol, exact: true }).click();
}

/** Type a value into the source field. */
export async function enterValue(page: Page, unitName: string, value: string): Promise<void> {
  await page.getByLabel('Value in ' + unitName).fill(value);
}
