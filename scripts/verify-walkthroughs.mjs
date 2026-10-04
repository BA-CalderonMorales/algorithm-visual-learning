import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';
import { algorithms } from '../src/algorithms/model.ts';

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const sizes = [{ width: 1440, height: 1000 }, { width: 900, height: 900 }, { width: 390, height: 844 }];

async function waitForTrace(page, name) {
  await page.waitForFunction(() => {
    const frame = document.querySelector('.walkthrough-frame');
    return frame?.contentDocument?.querySelector('.history-row, .row') && !document.querySelector('.walkthrough-status');
  }, null, { timeout: 12000 });
  const frame = page.frames().find(frame => frame.parentFrame());
  assert.equal(await frame.title(), `${name} Walkthrough`);
  assert.equal(await frame.locator('.history-row.current, .row.current, .row.active').count(), 1);
  assert.ok(await frame.locator('.legend').evaluate(el => !el.closest('.stage, .study-stage, .ledger')), 'Legend must remain outside the step scroller');
  const height = await page.locator('iframe').evaluate(el => el.clientHeight);
  assert.ok(height > 250, `Walkthrough is too short: ${height}px`);
  return frame;
}

try {
  for (const mode of ['development', 'production']) {
    const server = mode === 'development'
      ? await createServer({ server: { host: '127.0.0.1', port: 5186, strictPort: true } })
      : await preview({ preview: { host: '127.0.0.1', port: 5187, strictPort: true } });
    if (mode === 'development') await server.listen();
    const base = mode === 'development' ? 'http://127.0.0.1:5186/' : 'http://127.0.0.1:5187/algorithm-visual-learning/';
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      for (const size of sizes) {
        await page.setViewportSize(size);
        for (const algorithm of algorithms) {
          await page.goto(`${base}#/algorithms/${algorithm.id}/walkthrough`);
          const frame = await waitForTrace(page, algorithm.name);
          const counter = frame.locator('#step, #status, #qs-step');
          await frame.getByRole('button', { name: 'Next step', exact: true }).click();
          await counter.filter({ hasText: /Step 2 of/ }).waitFor();
          await frame.waitForFunction(() => document.querySelector('.history-row.current, .row.current, .row.active')?.dataset.motionPlayed === 'true');
          await frame.getByRole('button', { name: 'Back step', exact: true }).click();
          await counter.filter({ hasText: /Step 1 of/ }).waitFor();
          assert.ok(await frame.locator('.history-row.current, .row.current, .row.active').evaluate(el => {
            const row = el.getBoundingClientRect();
            const stage = el.closest('.stage, .study-stage, .ledger').getBoundingClientRect();
            return row.bottom > stage.top && row.top < stage.bottom;
          }), 'Focused step must intersect its scrolling viewport');
        }
      }
      await page.goto(`${base}#/algorithms/selection/walkthrough`);
      await waitForTrace(page, 'Selection Sort');
      await page.evaluate(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
      await waitForTrace(page, 'Selection Sort');
      await page.getByRole('tab', { name: 'Understand', exact: true }).click();
      await page.getByRole('tab', { name: 'Step-by-step', exact: true }).click();
      await waitForTrace(page, 'Selection Sort');
      await page.reload();
      await waitForTrace(page, 'Selection Sort');

      if (mode === 'development') {
        server.ws.send({ type: 'update', updates: [{ type: 'js-update', path: '/src/app/view.svelte', acceptedPath: '/src/app/view.svelte', timestamp: Date.now() }] });
        await page.waitForTimeout(500);
        await waitForTrace(page, 'Selection Sort');
      }

      // A server may return HTTP 200 with the app shell for an incorrect asset URL.
      const brokenDocument = '**/walkthroughs/selection_sort_walkthrough.html';
      await page.route(brokenDocument, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>DSA Study Studio</title><div id="app"></div>' }));
      await page.reload();
      await page.getByRole('button', { name: 'Reload walkthrough', exact: true }).waitFor({ timeout: 12000 });
      await page.unroute(brokenDocument);
      await page.getByRole('button', { name: 'Reload walkthrough', exact: true }).click();
      await waitForTrace(page, 'Selection Sort');
      await page.waitForTimeout(500);
      assert.deepEqual(errors, [], `${mode}: browser runtime errors`);
      console.log(`${mode}: all seven walkthroughs, three viewport sizes, navigation, reload, and fallback recovery passed`);
    } finally {
      await context.close();
      if (mode === 'development') await server.close();
      else await new Promise(resolve => server.httpServer.close(resolve));
    }
  }
} finally {
  await browser.close();
}
