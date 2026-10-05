import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
await mkdir('screenshots', { recursive: true });
const errors = [];
// Composite translucent ancestor backgrounds before measuring text contrast.
async function readable(locator) {
  const failures = await locator.evaluateAll(elements => {
    const rgba = value => {
      const values = (value.match(/[\d.]+/g) || []).map(Number);
      return value.startsWith('color(srgb ') ? values.map((v, i) => i < 3 ? v * 255 : v) : values;
    };
    const luminosity = color => color.slice(0, 3).map(v => {
      v /= 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return elements.filter(el => el.getClientRects().length && el.textContent.trim()).flatMap(el => {
      const ancestors = [];
      for (let parent = el; parent; parent = parent.parentElement) ancestors.unshift(parent);
      let background = [255, 255, 255];
      for (const parent of ancestors) {
        const color = rgba(getComputedStyle(parent).backgroundColor);
        const alpha = color[3] ?? 1;
        background = background.map((v, i) => color[i] * alpha + v * (1 - alpha));
      }
      const foreground = rgba(getComputedStyle(el).color);
      const [a, b] = [luminosity(foreground), luminosity(background)].sort((a,b) => b-a);
      const ratio = (a + .05) / (b + .05);
      return ratio >= 4.5 ? [] : [{ text: el.textContent.trim().slice(0, 45), ratio, classes: el.className, foreground, background }];
    });
  });
  assert.deepEqual(failures, [], 'Light-theme text contrast: ' + JSON.stringify(failures));
}
try {
  for (const theme of ['Paper', 'Dawn']) {
    const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/#/home');
    await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
    await page.getByRole('menuitemradio', { name: theme, exact: true }).click();
    await readable(page.locator('.library-copy p, .library-copy a, .library-panel h2, .library-navigation a'));
    await page.screenshot({ path: 'screenshots/light-' + theme.toLowerCase() + '-home.png' });
    for (const [route, selector] of [
      ['#/algorithms/sorting', '.catalog-table td, .catalog-toolbar input'],
      ['#/algorithms/selection/python', '.token-keyword, .token-comment, .line-number, .token-number'],
      ['#/discrete/telescoping/examples', '.signed-term, .pair-key span, .sum-result'],
      ['#/algorithms/selection/growth', '.growth-case-toggle, .growth-assumption'],
    ]) {
      await page.goto(origin + '/' + route);
      await page.locator(selector).first().waitFor();
      await readable(page.locator(selector));
      await page.screenshot({ path: 'screenshots/light-' + theme.toLowerCase() + '-' + route.split('/').slice(-2).join('-') + '.png' });
    }
    const input = page.getByRole('slider', { name: 'Maximum input size' });
    await input.fill('256');
    const before = await page.locator('.growth-swatch').first().evaluate(el => getComputedStyle(el).borderTopColor);
    await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
    await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.growth-swatch')).getPropertyValue('--case-color').trim() === '#5de0ac');
    const after = await page.locator('.growth-swatch').first().evaluate(el => getComputedStyle(el).borderTopColor);
    assert.notEqual(after, before, 'Chart legend adapts to theme');
    assert.equal(await input.inputValue(), '256', 'Changing chart theme preserves input size');
    await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
    await page.getByRole('menuitemradio', { name: theme, exact: true }).click();
    for (const id of ['selection', 'insertion', 'shell', 'merge', 'quick', 'tim', 'counting']) {
      await page.goto(origin + '/#/algorithms/' + id + '/walkthrough');
      await page.waitForFunction(({ id, theme }) => {
        const doc = document.querySelector('iframe')?.contentDocument;
        const filename = id === 'quick' ? 'quick_sort_partition_walkthrough.html' : id + '_sort_walkthrough.html';
        return doc?.URL.includes('/' + filename) && doc.readyState === 'complete'
          && doc.documentElement.dataset.theme === theme && doc.querySelector('#study-theme');
      }, { id, theme: theme.toLowerCase() });
      const frame = page.frameLocator('iframe');
      await frame.locator('html[data-theme="' + theme.toLowerCase() + '"]').waitFor();
      for (let step = 0; step < 5; step++) {
        await readable(frame.locator('.history-row.current .history-cell, .row.current .box, .row.active .cell, .pointer-markers'));
        await frame.getByRole('button', { name: 'Next step', exact: true }).click();
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + '/#/home');
    await page.screenshot({ path: 'screenshots/light-' + theme.toLowerCase() + '-phone.png' });
    await page.close();
    console.log(theme + ': text, syntax, math, charts and all seven walkthroughs passed contrast checks.');
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
