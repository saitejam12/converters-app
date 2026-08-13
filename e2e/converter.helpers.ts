import { expect, type Locator, type Page } from "@playwright/test";

/**
 * The eight categories the specification allows. Loose about wording,
 * strict about which measurement is meant.
 */
export const CATEGORY_PATTERNS: { name: string; match: RegExp }[] = [
  { name: "length / distance", match: /length|distance/i },
  { name: "weight / mass", match: /weight|mass/i },
  { name: "volume (liquid)", match: /volume|liquid/i },
  { name: "temperature", match: /temp/i },
  { name: "area", match: /area/i },
  { name: "speed", match: /speed/i },
  { name: "time duration", match: /time/i },
  { name: "digital data storage", match: /data|storage/i }
];

export const FORBIDDEN_PATTERNS: RegExp[] = [
  /time\s*zone/i,
  /\bzones?\b/i,
  /\butc\b/i,
  /\bgmt\b/i,
  /currenc/i,
  /exchange rate/i,
  /electric/i,
  /\bvolts?\b/i,
  /\bvoltage\b/i,
  /\bamperes?\b/i,
  /\bamps\b/i,
  /\bwatts?\b/i,
  /\bkilowatts?\b/i,
  /\bkwh\b/i,
  /\bohms?\b/i,
  /\bjoules?\b/i,
  /[$€£¥]/
];

export function categoryNav(page: Page): Locator {
  return page.getByRole("navigation", { name: /measurement category/i });
}

export function categoryButtons(page: Page): Locator {
  return categoryNav(page).getByRole("button");
}

export function categoryButton(page: Page, match: RegExp): Locator {
  return categoryButtons(page).filter({ hasText: match });
}

export async function selectCategory(page: Page, match: RegExp): Promise<void> {
  await categoryButton(page, match).click();
}

/** Only the unit chips carry a `title`; the keypad and category buttons do not. */
export function unitButtons(page: Page): Locator {
  return page.locator("button[title]");
}

export function selectedUnitButtons(page: Page): Locator {
  return page.locator('button[title][aria-pressed="true"]');
}

export function valueField(page: Page): Locator {
  return page.getByLabel(/^Value in/);
}

export function resultField(page: Page): Locator {
  return page.getByLabel(/^Result in/);
}

export async function resultNumber(page: Page): Promise<number> {
  const raw = await resultField(page).inputValue();
  return Number(raw.replace(/[\s,]/g, ""));
}

/** Titles of the currently selected source and target units, in that order. */
export async function selectedUnitTitles(page: Page): Promise<string[]> {
  const selected = selectedUnitButtons(page);
  await expect(selected).toHaveCount(2);
  return [
    (await selected.nth(0).getAttribute("title")) || "",
    (await selected.nth(1).getAttribute("title")) || ""
  ];
}

/** Unit symbols offered by the source selector and by the target selector. */
export async function offeredUnitSymbols(page: Page): Promise<{ source: string[]; target: string[] }> {
  const texts = (await unitButtons(page).allTextContents()).map(function (t) {
    return t.trim();
  });
  const half = texts.length / 2;
  return { source: texts.slice(0, half), target: texts.slice(half) };
}

/**
 * The converter is the only screen; it is served at the app root in most
 * builds and at /converter when the route is mounted explicitly.
 */
export async function gotoConverter(page: Page): Promise<void> {
  await page.goto("/");
  const nav = categoryNav(page);
  try {
    await nav.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    await page.goto("/converter");
    await nav.waitFor({ state: "visible", timeout: 5000 });
  }
}
