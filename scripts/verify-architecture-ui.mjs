import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { algorithms } from '../src/algorithms/model.ts';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
const failures = [];
try {
  for (const width of [1440, 900, 390]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    page.on('pageerror', error => failures.push(error.message));
    await page.goto(`${origin}/#/home`);
    await page.getByRole('tab', {name:'Explore',exact:true}).waitFor();
    await page.keyboard.press('Control+k');
    await page.getByRole('searchbox', {name:'Search topics',exact:true}).fill('telescoping');
    await page.locator('.site-search-result').first().waitFor();
    assert.ok((await page.locator('.site-search-result').first().innerText()).includes('Telescoping'));
    await page.keyboard.press('Escape');
    await page.goto(`${origin}/#/algorithms/sorting`);
    await page.locator('.catalog-table').waitFor();
    assert.ok((await page.locator('.catalog-table tbody tr').first().innerText()).includes('Selection'));
    for (const algorithm of algorithms) {
      for (const route of ['understand','python/simple','python/typed','javascript','typescript','practice','complexity','growth']) {
        await page.goto(`${origin}/#/algorithms/${algorithm.id}/${route}`);
        await page.locator('.algorithm-view').waitFor();
        if (route.includes('python') || ['javascript','typescript'].includes(route)) {
          await page.locator('.code-line').first().waitFor();
          assert.ok(await page.locator('.line-number').count() > 5, 'Source must have line numbers');
          const keyword = page.locator('.token-keyword').first();
          await keyword.waitFor();
          assert.notEqual(await keyword.evaluate(el=>getComputedStyle(el).color), await keyword.evaluate(el=>getComputedStyle(el.parentElement).color), 'Syntax highlighting must survive scoped styles');
        } else if (route === 'growth') {
          await page.locator('canvas').waitFor();
          assert.ok(await page.locator('canvas').evaluate(el=>el.width > 0));
        } else {
          assert.ok((await page.locator('.learning-view').innerText()).trim().length > 50, `${algorithm.id}/${route}: missing lesson`);
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth + 1), false, `${algorithm.id}/${route}: page overflow at ${width}px`);
      }
    }
    await page.close();
    console.log(`${width}px: catalog, search, all algorithm learning tabs, and all four highlighted implementations passed.`);
  }
  assert.deepEqual(failures, [], 'Runtime errors');
} finally { await browser.close(); }
