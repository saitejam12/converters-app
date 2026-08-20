import { test, expect } from "@playwright/test";

// AC-005: with a value entered and a result shown, changing the source or the
// target unit recalculates the result from the same entered value without the
// user re-entering it.
test("AC-005: changing the target unit recalculates without re-entering the value", async ({ page }) => {
  await page.goto("/");

  const value = page.getByLabel("Value in kilometre");
  await value.click();
  await value.fill("3");
  await expect(page.getByLabel("Result in mile")).toHaveValue("1.86411");

  // The 'To' unit row is the second block of buttons — nth(1) is its foot button.
  await page.getByTitle("foot", { exact: true }).nth(1).click();

  // Value is preserved (not re-entered) and the result recalculates.
  await expect(page.getByLabel("Value in kilometre")).toHaveValue("3");
  // 3 km -> ft = 3000 / 0.3048 = 9842.52
  await expect(page.getByLabel("Result in foot")).toHaveValue("9842.52");
});

test("AC-005: changing the source unit recalculates without re-entering the value", async ({ page }) => {
  await page.goto("/");

  const value = page.getByLabel("Value in kilometre");
  await value.click();
  await value.fill("3");

  const before = await page.getByLabel("Result in mile").inputValue();
  expect(before).toBe("1.86411");

  // The 'From' unit row is the first block of buttons — nth(0) is its metre button.
  await page.getByTitle("metre", { exact: true }).nth(0).click();

  // Source is now metre; the entered value stays put.
  await expect(page.getByLabel("Value in metre")).toHaveValue("3");

  const after = await page.getByLabel("Result in mile").inputValue();
  expect(after).not.toBe("");
  expect(after).not.toBe(before);
});
