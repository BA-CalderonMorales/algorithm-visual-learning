import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';
import { algorithms } from '../src/algorithms/model.ts';
import { languages } from '../src/shared/ui/code-view/languages.ts';
import { approaches, implementations, implementationHref } from '../src/problems/two-pointers/implementations/model.ts';
import { assertSharpCorners } from './assert-sharp-corners.mjs';

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
let choices = 0;
async function checkSource(page, name) {
  const parts = new URL(page.url()).hash.split('/');
  const language = parts.at(-1) === 'simple' ? 'python-simple' : parts.at(-1) === 'typed' ? 'python-typed' : parts.at(-1);
  const key = parts[1] === 'problems' ? parts[3] + '/' + parts[5] + '/' + language : parts[2] + '/' + language;
  await page.waitForFunction(({ name, key }) => {
    const region = document.querySelector('.python-code');
    return region?.dataset.sourceKey === key && region.textContent.includes(name) && region.querySelectorAll('.line-number').length >= 6;
  }, { name, key });
  const text = await page.locator('.python-code').innerText();
  assert.ok(text.includes(name), 'Selected source must match the route');
  assert.ok(await page.locator('.line-number').count() >= 6);
  const keyword = page.locator('.token-keyword').first();
  assert.notEqual(await keyword.evaluate(el => getComputedStyle(el).color), await keyword.evaluate(el => getComputedStyle(el.parentElement).color));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Page must not overflow horizontally');
  assert.ok(await page.locator('.python-code').evaluate(el => el.clientHeight > 180), 'Leave useful height for code');
  await assertSharpCorners(page);
  choices++;
}

try {
  for (const mode of ['development', 'production']) {
    const server = mode === 'development' ? await createServer({ server: { host: '127.0.0.1', port: 5188, strictPort: true } }) : await preview({ preview: { host: '127.0.0.1', port: 5189, strictPort: true } });
    if (mode === 'development') await server.listen();
    const base = mode === 'development' ? 'http://127.0.0.1:5188/' : 'http://127.0.0.1:5189/algorithm-visual-learning/';
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(response.url() + ': ' + response.status());
    });
    try {
      for (const width of [1440, 900, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const [id, definition] of Object.entries(implementations)) {
          for (const approach of approaches) for (const language of languages) {
            await page.goto(base + implementationHref(id, approach.id, language.id));
            await checkSource(page, language.id.startsWith('python') ? definition.pythonName : definition.functionName);
            assert.equal(await page.locator('#approach-tab-' + approach.id).getAttribute('aria-selected'), 'true');
            assert.equal(await page.locator('#code-tab-' + language.id).getAttribute('aria-selected'), 'true');
            const rail = await page.locator('.approach-rail').boundingBox();
            const main = await page.locator('.implementation-main').boundingBox();
            assert.ok(rail.x + rail.width <= main.x + 1, 'Vertical approach rail must stay beside code');
            assert.equal(await page.getByRole('tablist', { name: 'Choose solution approach' }).getAttribute('aria-orientation'), 'vertical');
          }
        }
        for (const algorithm of algorithms) for (const language of languages) {
          await page.goto(base + '#/algorithms/' + algorithm.id + '/' + language.path);
          await checkSource(page, algorithm.id + (language.id.startsWith('python') ? '_sort' : 'Sort'));
        }
      }
      await page.goto(base + implementationHref('two-sum', 'best', 'python-simple'));
      await checkSource(page, 'two_sum');
      // Vertical keyboard navigation uses Up/Down, horizontal language tabs use Left/Right.
      await page.locator('#approach-tab-best').focus();
      await page.keyboard.press('ArrowUp');
      await page.waitForURL('**/implementations/better/python/simple');
      await checkSource(page, 'two_sum');
      await page.locator('#code-tab-python-simple').focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForURL('**/implementations/better/python/typed');
      await checkSource(page, 'two_sum');
      await page.locator('#approach-tab-brute').click();
      await page.waitForURL('**/implementations/brute/python/typed');
      await page.goBack();
      await page.waitForURL('**/implementations/better/python/typed');
      await checkSource(page, 'two_sum');

      await page.setViewportSize({ width: 900, height: 700 });
      await page.evaluate(() => window.scrollTo(0, 90));
      const top = await page.evaluate(() => window.scrollY);
      await page.locator('#approach-tab-best').click();
      await checkSource(page, 'two_sum');
      assert.equal(await page.evaluate(() => window.scrollY), top, 'Approach changes must not reset outer scroll');
      await page.locator('#code-tab-typescript').click();
      await checkSource(page, 'twoSum');
      assert.equal(await page.evaluate(() => window.scrollY), top, 'Language changes must not reset outer scroll');
      await page.getByText('Why this approach / assumptions', { exact: true }).click();
      assert.ok(await page.locator('.approach-summary').innerText().then(text => text.includes('0-based indices')));
      await page.reload();
      await checkSource(page, 'twoSum');
      assert.deepEqual(errors, [], mode + ': runtime or asset failures');
      console.log(mode + ': all 64 code choices at four widths; vertical/horizontal keyboard navigation, links, history, scroll preservation, and reload passed.');
    } finally {
      await page.close();
      if (mode === 'development') await server.close();
      else await new Promise(resolve => server.httpServer.close(resolve));
    }
  }
} finally { await browser.close(); }
console.log(choices + ' rendered implementation checks passed.');
