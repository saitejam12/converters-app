import { expect, test, type Request } from '@playwright/test';

import { gotoConverter, readResult, selectCategory, selectUnit, setValue } from './support/converter';

/** Resource types that mean the page asked for data rather than for an asset. */
const DATA_RESOURCE_TYPES = ['fetch', 'xhr', 'eventsource'];

declare global {
  interface Window {
    __netCalls?: string[];
  }
}

test.describe('AC-027 no network call is made to fetch rates, factors or any other data', () => {
  test('converting issues no fetch, XHR or beacon and requests no data', async ({ page }) => {
    // Record anything the page itself tries to send, before any script runs.
    await page.addInitScript(() => {
      const calls: string[] = [];
      window.__netCalls = calls;

      const realFetch = window.fetch ? window.fetch.bind(window) : undefined;
      window.fetch = ((...args: unknown[]) => {
        calls.push('fetch ' + String(args[0]));
        return realFetch
          ? (realFetch as (...a: unknown[]) => Promise<Response>)(...args)
          : Promise.reject(new Error('offline'));
      }) as typeof window.fetch;

      const realOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function patchedOpen(this: XMLHttpRequest, ...args: unknown[]) {
        calls.push('xhr ' + String(args[0]) + ' ' + String(args[1]));
        return (realOpen as unknown as (...a: unknown[]) => void).apply(this, args);
      } as unknown as typeof XMLHttpRequest.prototype.open;

      if (typeof navigator.sendBeacon === 'function') {
        const realBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = ((url: string, data?: BodyInit | null) => {
          calls.push('beacon ' + url);
          return realBeacon(url, data);
        }) as typeof navigator.sendBeacon;
      }
    });

    const requests: Request[] = [];
    page.on('request', (request) => requests.push(request));

    await gotoConverter(page);
    await page.waitForLoadState('networkidle').catch(() => undefined);

    // Everything up to here is the browser loading the static bundle. What the
    // criterion is about is what happens while converting.
    requests.length = 0;

    for (const category of ['Length', 'Weight', 'Volume', 'Temp', 'Area', 'Speed', 'Time', 'Data']) {
      await selectCategory(page, category);
      await setValue(page, '12.5');
      expect(await readResult(page)).not.toBe('');
    }

    await selectCategory(page, 'Length');
    await selectUnit(page, 'from', 'mi');
    await selectUnit(page, 'to', 'km');
    await setValue(page, '1');
    expect(await readResult(page)).not.toBe('');

    await page.waitForTimeout(500);

    const calls = await page.evaluate(() => (window.__netCalls ?? []).slice());
    expect(calls, 'the page called the network: ' + calls.join(', ')).toEqual([]);

    const dataRequests = requests
      .filter((request) => DATA_RESOURCE_TYPES.includes(request.resourceType()))
      .map((request) => request.resourceType() + ' ' + request.url());
    expect(dataRequests, 'the page requested data while converting').toEqual([]);
  });
});
