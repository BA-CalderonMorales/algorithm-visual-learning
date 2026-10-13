import { exposeSectionTabs } from './expose-section-tabs.mjs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.env.PLAY_PREVIEW_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const routes = [
  'home',
  'discrete',
  'complexity',
  'structures',
  'algorithms/sorting',
  'problems',
  'problems/sliding-window',
  'discrete/induction/understand',
  'complexity/time/visualize',
  'structures/list-insertion/visualize',
  'algorithms/shell/play',
  'algorithms/merge/understand',
  'algorithms/quick/walkthrough',
  'algorithms/bubble/python/simple',
  'problems/stack/daily-temperatures/play',
  'problems/two-pointers/two-sum/implementations/best/python/simple',
];
await mkdir('../../outputs/navigation-preview', { recursive: true });
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(`${base}/#/${route}`);
      await page.locator('.tab-workspace').first().waitFor();
      await page.waitForTimeout(40);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
        `page overflow ${width} ${route}`,
      );
      assert.deepEqual(await page.locator('.domain-tabs button').allTextContents(), [
        'Discrete Math',
        'Complexity',
        'Data Structures',
        'Algorithms',
        'Problems',
      ]);
      const lists = await page
        .locator('main [role=tablist]')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-orientation')));
      assert.ok(lists.length);
      assert.ok(
        lists.every((value) => value === 'vertical'),
        `${route}: all section selectors vertical`,
      );
      const scrolling = await page
        .locator('main .study-panel, main .problem-panel, main .library-panel')
        .evaluateAll((nodes) =>
          nodes.filter((n) => getComputedStyle(n).overflowY !== 'visible').map((n) => n.className),
        );
      assert.deepEqual(scrolling, [], `${route}: no nested lesson scroller`);
    }
    await page.goto(`${base}/#/structures/list-insertion/visualize`);
    await page.locator('.tab-workspace').first().waitFor();
    const workspace = page.locator('.tab-workspace').first();
    {
      await workspace.locator('.section-toggle').first().click();
      assert.equal(await workspace.locator('.section-options').first().isVisible(), true);
    }
    await page.getByRole('tab', { name: 'Understand', exact: true }).click();
    await page.locator('#study-tab-understand[aria-selected="true"]').waitFor({ state: 'attached' });
    {
      await page.waitForFunction(
        () => document.querySelector('.tab-workspace .section-toggle')?.getAttribute('aria-expanded') === 'false',
      );
      assert.equal(await workspace.locator('.section-toggle').first().getAttribute('aria-expanded'), 'false');
      await workspace.locator('.section-toggle').first().click();
    }
    const first = page.getByRole('tab', { name: 'Understand', exact: true });
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForURL('**/visualize');
    if (width >= 700) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(50);
      await exposeSectionTabs(page);
      assert.ok(await page.getByRole('tab', { name: 'Examples', exact: true }).isVisible());
      await page.getByRole('tab', { name: 'Examples', exact: true }).click();
      await page.waitForTimeout(80);
      const contentTop = await page.locator('.study-panel').evaluate((n) => n.getBoundingClientRect().top);
      assert.ok(contentTop >= 50 && contentTop < 350, `new material begins beneath header: ${contentTop}`);
    }
    await page.screenshot({ path: `../../outputs/navigation-preview/sections-${width}.png`, fullPage: true });
    console.log(
      `${width}px: domain progression, ${routes.length} domain/lesson/code routes, vertical selectors, single-page reading, keyboard and section navigation passed.`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
