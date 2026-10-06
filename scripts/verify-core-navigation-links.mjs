import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {entries} from '../src/shared/study/library.ts';
import {problems} from '../src/problems/model.ts';

const browser = await chromium.launch({headless:true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
const page = await browser.newPage();
const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const routes = ['#/home', ...entries.flatMap(entry => [entry.href, entry.href + '/connections']), '#/problems/two-pointers'];
try {
  for (const theme of ['dark', 'midnight', 'warm', 'paper', 'dawn']) {
    for (const width of [1440, 900, 390, 320]) {
      await page.setViewportSize({width,height:1000});
      for (const route of routes) {
        await page.goto(origin + '/' + route);
        await page.locator('.library-panel').waitFor();
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        const links = page.locator('.library-panel .navigation-link');
        assert.ok(await links.count() > 0, route + ' shares the navigation-link component');
        const metrics = await links.evaluateAll(els => els.map(el => ({
          height:el.getBoundingClientRect().height, border:getComputedStyle(el).borderTopStyle,
          overflow:el.scrollWidth > el.clientWidth + 2, radius:getComputedStyle(el).borderTopLeftRadius,
          arrow:Boolean(el.querySelector('svg')), href:el.getAttribute('href'),
        })));
        assert.ok(metrics.every(link => link.height >= 44 && link.border === 'solid' && !link.overflow && link.radius === '0px' && link.arrow && link.href),
          theme + '/' + width + '/' + route + ': sharp, bounded, touch-friendly controls');
        assert.equal(await page.locator('.library-panel').evaluate(el => el.scrollWidth > el.clientWidth + 1), false, route + ' panel overflow');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, route + ' page overflow');
        const headings = await page.locator('.library-copy h2 a, .catalog-algorithm-link, .problem-row h2 a').evaluateAll(els => els.map(el => ({
          text:el.textContent, decoration:getComputedStyle(el).textDecorationLine,
        })));
        assert.ok(headings.every(link => link.decoration === 'underline' && !/[→↗]/.test(link.text)), 'Navigation titles stay underlined without arrows');
      }
    }
    console.log(theme + ': shared destination controls passed across core directories and responsive widths.');
  }
  await page.goto(origin + '/#/algorithms/sorting');
  await page.getByRole('button', {name:'Difficulty'}).waitFor();
  assert.equal(await page.getByRole('button', {name:'Difficulty'}).evaluate(el => getComputedStyle(el).borderTopStyle), 'solid');
  await page.getByRole('link', {name:'Trace steps',exact:true}).first().click();
  await page.waitForURL('**/#/algorithms/selection/walkthrough');
  await page.goto(origin + '/#/problems/two-pointers');
  await page.getByRole('link', {name:'Watch ' + problems[0].title,exact:true}).click();
  await page.waitForURL('**/#/problems/two-pointers/two-sum/play');
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
