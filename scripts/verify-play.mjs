import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const routes = ['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting'].map(id => `/algorithms/${id}/play`)
  .concat(['/discrete/induction/visualize', '/discrete/telescoping/visualize', '/discrete/master-theorem/visualize', '/complexity/time/visualize', '/complexity/space/visualize']);
const errors = [];
const page = await browser.newPage();
page.on('pageerror', error => errors.push(error.message));
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 900, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      console.log(`Checking ${viewport.width}px ${route}`);
      await page.goto(`${origin}/#${route}`);
      const player = page.locator('.concept-film');
      await player.waitFor();
      assert.deepEqual(await player.getByLabel('Playback speed').locator('option').evaluateAll(options => options.map(o => o.value)), ['0.5', '1', '1.5', '2', '2.5', '3']);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `Page overflow at ${viewport.width}: ${route}`);
      await player.getByLabel('Playback speed').selectOption('3');
      await player.getByLabel('Play animation', { exact: true }).click();
      await page.waitForTimeout(600);
      await player.getByLabel('Pause animation', { exact: true }).click();
      const advanced = Number(await player.getByLabel('Seek animation', { exact: true }).inputValue());
      assert.ok(advanced > 1.1 && advanced < 3, `3x playback did not advance at expected rate: ${advanced}`);
      await player.getByLabel('Reverse playback', { exact: true }).click();
      await player.getByLabel('Play animation', { exact: true }).click();
      await page.waitForTimeout(200);
      await player.getByLabel('Pause animation', { exact: true }).click();
      assert.ok(Number(await player.getByLabel('Seek animation', { exact: true }).inputValue()) < advanced, 'Reverse should decrease timeline time');
    }
    console.log(`Play films: all algorithm and concept routes passed at ${viewport.width}px.`);
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  await browser.close();
}
