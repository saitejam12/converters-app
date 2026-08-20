import { test, expect } from "@playwright/test";

// US-004 — Read-only result field, driven the way a person would.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("AC-010: typing into the result field leaves its value unchanged", async ({ page }) => {
  await page.getByLabel("Value in kilometre").fill("10");

  const result = page.getByLabel("Result in mile");
  const before = await result.inputValue();
  expect(before).not.toBe("");

  await result.click();
  await page.keyboard.type("999");

  expect(await result.inputValue()).toBe(before);
});

test("AC-011: the result is visibly read-only yet remains selectable", async ({ page }) => {
  await page.getByLabel("Value in kilometre").fill("10");

  // Visually distinguishable as read-only output.
  await expect(page.getByText(/read only/i)).toBeVisible();

  const result = page.getByLabel("Result in mile");
  await expect(result).toHaveJSProperty("readOnly", true);
  // Not disabled, so normal browser selection/copy still works.
  await expect(result).not.toBeDisabled();
});
