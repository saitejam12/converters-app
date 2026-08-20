import { test, expect } from "@playwright/test";

// US-005 — No stored or remembered state.
// Each spec is named after the acceptance criterion it proves and drives the
// flow the way a person would, including a genuine page reload.

test.describe("US-005 — no stored or remembered state", () => {
  test("AC-012: reloading returns to default category and units with empty input and blank result", async ({ page }) => {
    await page.goto("/");

    // Default state: length category, kilometre -> mile.
    const kmInput = page.getByLabel("Value in kilometre");
    await expect(kmInput).toBeVisible();

    // Perform a conversion.
    await kmInput.fill("42.5");
    await expect(page.getByLabel("Result in mile")).not.toHaveValue("");

    // Move to a non-default category and non-default units.
    await page.getByRole("button", { name: "Weight" }).click();
    await page.getByTitle("gram").click();
    await page.getByTitle("ounce").click();
    await expect(page.getByLabel("Value in gram")).toBeVisible();

    // Reopen the app.
    await page.reload();

    // Back to defaults, with empty input and blank result.
    const kmAfter = page.getByLabel("Value in kilometre");
    await expect(kmAfter).toBeVisible();
    await expect(kmAfter).toHaveValue("");
    await expect(page.getByLabel("Result in mile")).toHaveValue("");
    await expect(page.getByLabel("Value in gram")).toHaveCount(0);
  });

  test("AC-013: after use no history, favourites, preferences or user data is written to browser storage", async ({ page, context }) => {
    await page.goto("/");

    // Use the app across categories and units.
    await page.getByLabel("Value in kilometre").fill("1234.5");
    await page.getByRole("button", { name: "Weight" }).click();
    await page.getByTitle("pound").click();
    await page.getByRole("button", { name: "Temp" }).click();
    await page.getByLabel(/^Value in /).fill("100");

    // localStorage and sessionStorage are empty.
    const storage = await page.evaluate(() => ({
      local: { ...window.localStorage },
      session: { ...window.sessionStorage },
    }));
    expect(Object.keys(storage.local)).toEqual([]);
    expect(Object.keys(storage.session)).toEqual([]);

    // No cookies were set.
    const cookies = await context.cookies();
    expect(cookies).toEqual([]);

    // No IndexedDB databases were created.
    const idbNames = await page.evaluate(async () => {
      if (typeof indexedDB === "undefined" || !indexedDB.databases) return [];
      const dbs = await indexedDB.databases();
      return dbs.map((d) => d.name);
    });
    expect(idbNames).toEqual([]);
  });
});
