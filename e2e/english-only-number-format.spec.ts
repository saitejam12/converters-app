import { test, expect } from "@playwright/test";

// US-012 — English-only single number format.
//
// The component/unit tests already assert the formatter and screen behaviour
// in the default test locale. These end-to-end specs prove the part the
// specification actually turns on — "in ANY browser locale" — by loading the
// real app under a locale whose native number format uses a comma decimal
// separator and digit grouping (de-DE). If any locale-based reformatting crept
// in (toLocaleString / Intl.NumberFormat), these would fail.
test.use({ locale: "de-DE" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("AC-036: a dot decimal separator is accepted and converted correctly in a comma-decimal locale", async ({ page }) => {
  const value = page.getByLabel("Value in kilometre");
  await value.fill("1.5");

  // 1.5 km -> mi = 1.5 * 1000 / 1609.344 = 0.932057 (6 significant figures).
  const result = page.getByLabel("Result in mile");
  await expect(result).toHaveValue("0.932057");
});

test("AC-037: the displayed result uses a dot separator, no grouping and English labels, with no locale reformatting", async ({ page }) => {
  const value = page.getByLabel("Value in kilometre");
  await value.fill("1234.5");

  const result = page.getByLabel("Result in mile");
  const shown = await result.inputValue();

  // Dot decimal separator, and never a comma (which de-DE would use for both
  // the decimal point and thousands grouping).
  expect(shown).toContain(".");
  expect(shown).not.toContain(",");

  // English-only labels remain regardless of locale.
  await expect(page.getByRole("heading", { name: "Converter" })).toBeVisible();
  await expect(page.getByText("kilometre")).toBeVisible();
  await expect(page.getByText("mile")).toBeVisible();
});

test("AC-038: no language or number-format setting exists — the format is fixed", async ({ page }) => {
  await expect(page.getByText(/language/i)).toHaveCount(0);
  await expect(page.getByText(/number format/i)).toHaveCount(0);
  await expect(page.getByText(/locale/i)).toHaveCount(0);
  // There is no settings control (select/combobox) to change format or language.
  await expect(page.getByRole("combobox")).toHaveCount(0);
});
