import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {entries} from '../src/shared/study/library.ts';
import {assertSharpCorners} from './assert-sharp-corners.mjs';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless:true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}),
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const theme of ['dark', 'midnight', 'warm', 'paper', 'dawn']) {
    for (const width of [1440, 900, 600, 390, 320]) {
      await page.setViewportSize({width,height:1000});
      for (const route of ['home', 'home/resources', 'home/author']) {
        await page.goto(origin + '/#/' + route);
        await page.locator('.library-panel').waitFor();
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        await assertSharpCorners(page);
        const controls = page.locator('.library-panel .navigation-link');
        assert.ok(await controls.count() > 0, route + ' exposes link controls');
        const metrics = await controls.evaluateAll(links => links.map(link => {
          const style = getComputedStyle(link);
          return {
            href:link.getAttribute('href'), height:link.getBoundingClientRect().height,
            border:style.borderTopStyle, decoration:style.textDecorationLine,
            overflow:link.scrollWidth > link.clientWidth + 2,
          };
        }));
        assert.ok(metrics.every(link => link.href && link.height >= 44 && link.border === 'solid' && !link.overflow),
          theme + '/' + width + '/' + route + ': readable, bounded touch targets');
        assert.equal(await page.locator('.library-panel').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        if (route === 'home') {
          assert.equal(await page.getByText('One idea across subjects', {exact:true}).count(), 0, 'Home only shows domain navigation');
          assert.equal(await page.locator('.library-copy .heading-arrow').count(), 0, 'Home titles do not include navigation arrows');
          assert.equal(await controls.locator('svg').count(), await controls.count(), 'Link controls retain their navigation arrows');
          assert.equal(await page.locator('.library-links .navigation-link').count(), entries.reduce((sum, entry) => sum + entry.links.length, 0));
          assert.equal(await page.locator('.library-copy h2 a').first().evaluate(el => getComputedStyle(el).textDecorationLine), 'underline');
          const first = controls.first();
          await first.focus();
          assert.equal(await first.evaluate(el => getComputedStyle(el).outlineStyle), 'solid', 'Keyboard focus stays visible');
          const before = await first.evaluate(el => getComputedStyle(el).backgroundColor);
          await first.hover();
          await page.waitForTimeout(140);
          assert.notEqual(await first.evaluate(el => getComputedStyle(el).backgroundColor), before, 'Hover reveals interaction');
        } else {
          assert.equal(await controls.first().getAttribute('target'), '_blank');
          assert.match(await controls.first().getAttribute('rel'), /noopener/);
        }
      }
    }
    console.log(theme + ': Home links passed at desktop, tablet, and phone widths.');
  }
  await page.goto(origin + '/#/home');
  await page.locator('.library-links .navigation-link').first().click();
  await page.waitForURL('**/#/algorithms/selection/understand');
  await page.goto(origin + '/#/discrete');
  await page.locator('.library-links').first().waitFor();
  assert.ok(await page.locator('.library-links .navigation-link').count() > 0, 'Core directories share Home link controls');
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
