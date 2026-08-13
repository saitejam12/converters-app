import { expect, test, type Page } from '@playwright/test';

/**
 * US-001 -- Open straight onto the converter.
 * One test per acceptance criterion, driven the way a person would.
 */

function categoryNav(page: Page) {
  return page.getByRole('navigation', { name: 'Measurement category' });
}

/** The "From" unit row is rendered before the "To" row, so the first match is the source. */
function sourceUnitButton(page: Page, symbol: string) {
  return page.getByRole('button', { name: symbol, exact: true }).first();
}

function targetUnitButton(page: Page, symbol: string) {
  return page.getByRole('button', { name: symbol, exact: true }).nth(1);
}

test('AC-001: loading the app URL shows the converter immediately, with no sign-in, splash, onboarding or consent step', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Converter' })).toBeVisible();

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('input[type="password"], input[type="email"]')).toHaveCount(0);
  await expect(
    page.getByText(
      /sign in|sign up|log ?in|register|create account|get started|accept cookies|consent|onboard|welcome/i
    )
  ).toHaveCount(0);

  // Nothing had to be dismissed or agreed to first: the very next act is a conversion.
  await page.getByLabel('Value in kilometre').fill('10');
  await expect(page.getByLabel('Result in mile')).toHaveValue(/^6\.21/);
});

test('AC-002: the category selector, the numeric input with its source unit and the read-only result with its target unit are all on one screen, with no menu, tabs or links', async ({ page }) => {
  await page.goto('/');
  const landedOn = new URL(page.url()).pathname;

  const categories = categoryNav(page);
  await expect(categories).toBeVisible();
  await expect(categories.getByRole('button')).toHaveCount(8);

  const value = page.getByLabel('Value in kilometre');
  await expect(value).toBeVisible();
  await expect(value).toBeEditable();

  const result = page.getByLabel('Result in mile');
  await expect(result).toBeVisible();
  await expect(result).not.toBeEditable();

  await expect(sourceUnitButton(page, 'km')).toBeVisible();
  await expect(sourceUnitButton(page, 'km')).toHaveAttribute('aria-pressed', 'true');
  await expect(targetUnitButton(page, 'mi')).toBeVisible();
  await expect(targetUnitButton(page, 'mi')).toHaveAttribute('aria-pressed', 'true');

  // Both unit selectors and the category selector are operable without leaving the screen.
  await sourceUnitButton(page, 'm').click();
  await expect(page.getByLabel('Value in metre')).toBeVisible();
  await targetUnitButton(page, 'ft').click();
  await expect(page.getByLabel('Result in foot')).toBeVisible();
  await categories.getByRole('button', { name: 'Volume', exact: true }).click();
  await expect(page.getByLabel('Value in litre')).toBeVisible();

  await expect(page.getByRole('link')).toHaveCount(0);
  await expect(page.locator('a[href]')).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('menuitem')).toHaveCount(0);

  expect(new URL(page.url()).pathname).toBe(landedOn);
});

test('AC-003: a fresh load pre-selects a default category and a default source and target unit pair, so the app is usable without set-up', async ({ page }) => {
  await page.goto('/');

  const categories = categoryNav(page);
  const selectedCategory = categories.locator('button[aria-pressed="true"]');
  await expect(selectedCategory).toHaveCount(1);
  await expect(selectedCategory).toHaveText('Length');

  const value = page.getByLabel('Value in kilometre');
  const result = page.getByLabel('Result in mile');
  await expect(value).toBeVisible();
  await expect(result).toBeVisible();
  await expect(value).toHaveValue('');
  await expect(sourceUnitButton(page, 'km')).toHaveAttribute('aria-pressed', 'true');
  await expect(targetUnitButton(page, 'mi')).toHaveAttribute('aria-pressed', 'true');

  // No set-up: typing a value is the only step needed to get a conversion.
  await value.fill('10');
  await expect(result).toHaveValue(/^6\.21/);

  // "No prior use": a reload comes back to the same defaults rather than to remembered state.
  await categories.getByRole('button', { name: 'Weight', exact: true }).click();
  await expect(page.getByLabel('Value in kilogram')).toBeVisible();

  await page.reload();

  await expect(categoryNav(page).locator('button[aria-pressed="true"]')).toHaveText('Length');
  await expect(page.getByLabel('Value in kilometre')).toHaveValue('');
  await expect(page.getByLabel('Result in mile')).toHaveValue('');
});
