import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.PLAY_PREVIEW_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
const routes = [
  'problems/two-pointers/two-sum/understand',
  'problems/two-pointers/two-sum/implementations/best/python/simple',
  'problems/stack/daily-temperatures/understand',
  'discrete/induction/understand',
  'complexity/time/visualize',
  'structures/list-insertion/visualize',
  'algorithms/merge/play',
  'algorithms/bubble/python/simple',
];
for (const width of [1306, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 850 } });
  for (const route of routes) {
    await page.goto(`${base}/#/${route}`);
    await page.locator('.section-toggle').first().waitFor();
    for (const workspace of await page.locator('.tab-workspace').all()) {
      const toggle = workspace.locator(':scope > .section-rail > .section-toggle');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      const content = workspace.locator(':scope > .section-content');
      const before = await content.boundingBox();
      await toggle.click();
      const after = await content.boundingBox();
      for (const key of ['x', 'y', 'width']) assert.equal(after[key], before[key], 'Menu must not move lesson content');
      const menu = workspace.locator(':scope > .section-rail > .section-options');
      assert.ok(await menu.isVisible());
      const rect = await menu.boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= width, 'Menu stays in viewport');
      await menu.dispatchEvent('pointerdown');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'A press inside keeps the menu open');
      await page.locator('.intro-label').first().click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Outside press dismisses menu');
      await toggle.click();
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Escape dismisses menu');
      assert.ok(await toggle.evaluate((el) => el === document.activeElement), 'Escape returns focus to toggle');
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
    console.log(`${width}px ${route}: dropdowns open without moving content`);
  }
  await page.close();
}
await browser.close();
