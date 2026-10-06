import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('screenshots/lesson-controls', { recursive: true });
const routes = [
  'algorithms/selection/understand', 'algorithms/selection/practice',
  'algorithms/quick/practice', 'algorithms/selection/complexity', 'algorithms/selection/growth',
  'discrete/induction/understand', 'discrete/telescoping/examples',
  'discrete/master-theorem/practice', 'complexity/asymptotic/practice', 'complexity/time/practice',
  ...['two-sum', 'container', 'three-sum'].map(id => `problems/two-pointers/${id}/practice`),
  'algorithms/selection/play', 'discrete/telescoping/visualize', 'problems/two-pointers/two-sum/play',
];

async function assertControls(route) {
  const links = page.locator('main .navigation-link');
  const metrics = await links.evaluateAll(elements => elements.map(el => ({
    height: el.getBoundingClientRect().height, border: getComputedStyle(el).borderTopStyle,
    radius: getComputedStyle(el).borderTopLeftRadius, overflow: el.scrollWidth > el.clientWidth + 2,
    href: el.getAttribute('href'), arrow: Boolean(el.querySelector('svg[aria-hidden="true"]')),
  })));
  assert.ok(metrics.every(link => link.height >= 44 && link.border === 'solid'
    && link.radius === '0px' && !link.overflow && link.href && link.arrow), route + ': destination controls');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, route + ': page overflow');
  for (const selector of ['.learning-view', '.study-panel', '.problem-panel', '.concept-film']) {
    assert.ok(await page.locator(selector).evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 2)), route + ': panel overflow');
  }
}

try {
  for (const theme of ['dark', 'paper', 'dawn']) {
    for (const width of [1440, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(`${origin}/#/${route}`);
        await page.locator('main').waitFor();
        await page.locator('.algorithm-view, .study-workspace, .problem-workspace').first().waitFor();
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        const summary = page.locator('.reasoning-disclosure > summary').first();
        if (route.endsWith('/practice')) {
          await summary.waitFor();
          assert.ok(await summary.evaluate(el => el.getBoundingClientRect().height >= 44));
          assert.equal(await summary.evaluate(el => getComputedStyle(el.parentElement).borderTopStyle), 'solid');
          await summary.focus();
          await page.keyboard.press('Enter');
          const answer = page.locator('.reasoning-disclosure[open] > p').first();
          await answer.waitFor();
          assert.ok((await answer.innerText()).trim().length > 20, 'Reasoning remains intact');
          assert.equal(await summary.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
          await page.keyboard.press('Space');
          assert.equal(await page.locator('.reasoning-disclosure[open]').count(), 0, 'Native keyboard close');
        }
        const player = page.locator('.concept-film');
        if (await player.count()) {
          const disclosure = player.locator('.more > summary');
          await disclosure.focus();
          await page.keyboard.press('Enter');
          const buttons = player.locator('.film-transcript button');
          assert.ok(await buttons.count() > 2);
          assert.ok(await buttons.evaluateAll(elements => elements.every(el => {
            const style = getComputedStyle(el);
            return el.getBoundingClientRect().height >= 44 && style.borderTopStyle === 'solid'
              && style.borderTopLeftRadius === '0px' && el.title && el.querySelector('.scene-jump-icon[aria-hidden="true"]');
          })), 'Transcript titles visibly jump to a scene');
          const title = await buttons.last().innerText();
          await buttons.last().click();
          assert.ok(title.includes(await player.locator('.scene-heading h2').innerText()));
          assert.equal(await buttons.filter({ has: page.locator('.scene-jump-label') }).count(), await buttons.count());
          assert.equal(await player.locator('.film-transcript button[aria-current="step"]').count(), 1);
          await page.keyboard.press('Tab');
          await buttons.last().focus();
          assert.equal(await buttons.last().evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
        }
        await assertControls(route);
        if (theme === 'dark' && [1440, 390].includes(width) && ['algorithms/quick/practice', 'problems/two-pointers/two-sum/play', 'complexity/time/practice'].includes(route)) {
          await page.screenshot({ path: `screenshots/lesson-controls/${route.split('/').slice(-2).join('-')}-${width}.png` });
        }
      }
      console.log(`${theme}/${width}px: lesson actions, native reasoning reveals, and scene jumps passed.`);
    }
  }
  // Force a malformed iframe response to exercise recovery without weakening readiness checks.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/selection_sort_walkthrough.html*', route => route.fulfill({
    contentType: 'text/html', body: '<html><head><title>Not a walkthrough</title></head><body>Unavailable</body></html>',
  }));
  await page.goto(`${origin}/#/algorithms/selection/walkthrough`);
  await page.locator('.walkthrough-status[role="alert"]').waitFor({ timeout: 12000 });
  const standalone = page.getByRole('link', { name: 'Open standalone (opens in a new tab)', exact: true });
  assert.equal(await standalone.getAttribute('target'), '_blank');
  assert.ok(await standalone.evaluate(el => el.getBoundingClientRect().height >= 44));
  assert.ok(await page.getByRole('button', { name: 'Reload walkthrough', exact: true }).evaluate(el => el.getBoundingClientRect().height >= 44));
  await page.unroute('**/selection_sort_walkthrough.html*');
  await page.getByRole('button', { name: 'Reload walkthrough', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.walkthrough-host')?.getAttribute('aria-busy') === 'false'
    && !document.querySelector('.walkthrough-status'), null, { timeout: 15000 });
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('Walkthrough recovery: visible standalone/reload controls and successful retry passed.');
} finally { await browser.close(); }
