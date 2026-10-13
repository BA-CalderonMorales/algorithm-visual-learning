import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.PLAY_PREVIEW_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
for (const width of [1306, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 850 } });
  for (const route of ['discrete', 'complexity', 'structures', 'algorithms/sorting', 'problems']) {
    await page.goto(`${base}/#/${route}`);
    const menu = page.locator('.library-workspace .section-toggle').first();
    await menu.waitFor();
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert.ok(
      await page.locator('.library-panel').evaluate((e) => parseFloat(getComputedStyle(e).paddingTop) <= 6),
      'No extra menu row above content',
    );
    if (route !== 'algorithms/sorting') {
      const first = await page.locator('.library-panel > :first-child').boundingBox();
      const button = await menu.boundingBox();
      assert.ok(first.x >= button.x + button.width, 'Content stays beside toggle');
    }
    const bounds = () => page.locator('.library-panel').boundingBox();
    const before = await bounds();
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    assert.deepEqual(await bounds(), before);
    await page.locator('.library-workspace').getByRole('tab', { name: 'Connections', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('.library-workspace .section-toggle')?.getAttribute('aria-expanded') === 'false',
    );
    const eye = page.locator('.intro-toggle').first();
    await eye.hover();
    const tip = await page.locator('.intro-tooltip').first().boundingBox();
    const button = await eye.boundingBox();
    assert.ok(
      tip.x >= 0 &&
        tip.x + tip.width <= button.x &&
        tip.y >= button.y &&
        tip.y + tip.height <= button.y + button.height,
    );
    console.log(`${width}px ${route}: consistent dropdown, stable layout, tooltip beside eye`);
  }
  await page.close();
}
await browser.close();
