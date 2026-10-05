import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { problems, problemHref } from '../src/problems/model.ts';
import { examples } from '../src/problems/two-pointers/films.ts';
import { assertSharpCorners } from './assert-sharp-corners.mjs';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await mkdir('screenshots', { recursive: true });
async function noOverflow(route) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${route}: page overflow`);
  assert.equal(await page.locator('.problem-panel').evaluate((el) => el.scrollWidth > el.clientWidth + 1), false, `${route}: panel overflow`);
  await assertSharpCorners(page);
  const crumbs = await page.locator('.breadcrumb-item').evaluateAll((elements) => elements.filter((el) => el.getClientRects().length).map((el) => {
    const box = el.getBoundingClientRect();
    return { left: box.left, right: box.right };
  }));
  for (let index = 1; index < crumbs.length; index++) assert.ok(crumbs[index].left >= crumbs[index - 1].right - 1, 'Breadcrumb items never overlap');
}
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 900, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    await page.setViewportSize(viewport);
    for (const problem of problems) {
      for (const view of ['understand', 'practice', 'play']) {
        const route = problemHref(problem.id, view);
        await page.goto(`${origin}/${route}`);
        await page.locator('.problem-panel').waitFor();
        assert.equal(await page.getByRole('tab', { name: view === 'play' ? 'Play' : view === 'practice' ? 'Practice' : 'Understand', exact: true }).getAttribute('aria-selected'), 'true');
        assert.equal(await page.locator('main h1').count(), 0, 'Intro collapsed');
        await noOverflow(route);
        assert.ok((await page.locator('.problem-panel').innerText()).length > 150);
        assert.match(await page.title(), new RegExp(problem.title.replace(/[()]/g, '\\$&')));
        const reference = page.getByRole('link', { name: 'Go deeper on Hello Interview ↗', exact: true });
        assert.equal(await reference.getAttribute('href'), problem.reference);
        if (view === 'practice') {
          assert.equal(await page.locator('.checks details').count(), 4);
          await page.locator('.checks summary').first().click();
          assert.equal(await page.locator('.checks details').first().getAttribute('open'), '');
        }
        if (view !== 'play') continue;
        await page.waitForFunction(() => document.querySelector('canvas')?.width > 500);
        for (const choice of examples[problem.id]) {
          await page.getByRole('combobox', { name: 'Visualization example' }).selectOption(choice.id);
          await page.waitForFunction(() => document.querySelector('.film-time')?.textContent.trim().startsWith('0:00'));
          const canvas = page.locator('canvas');
          assert.ok(await canvas.evaluate((el) => {
            const pixels = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
            let bright = 0;
            for (let p = 0; p < pixels.length; p += 16) if (pixels[p] > 80 || pixels[p + 1] > 80) bright++;
            return bright > 100;
          }), 'Real diagram pixels, not just a blank stage');
          await page.getByRole('button', { name: 'Next scene', exact: true }).click();
          await page.getByRole('button', { name: 'Previous scene', exact: true }).click();
          await page.getByRole('button', { name: 'Play animation', exact: true }).click();
          await page.getByRole('button', { name: 'Pause animation', exact: true }).click();
          await page.getByRole('combobox', { name: 'Playback speed' }).selectOption('3');
          await page.getByRole('button', { name: 'Reverse playback', exact: true }).click();
          assert.equal(await page.getByRole('button', { name: 'Reverse playback', exact: true }).getAttribute('aria-pressed'), 'true');
          await page.getByRole('button', { name: 'Restart animation', exact: true }).click();
          assert.match(await page.locator('.scene-meta').innerText(), new RegExp(`${choice.film.frames.length} / ${choice.film.frames.length}`));
          await page.getByRole('button', { name: 'Reverse playback', exact: true }).click();
          await page.getByRole('button', { name: 'Restart animation', exact: true }).click();
        }
        await page.getByRole('combobox', { name: 'Visualization example' }).selectOption(problem.id);
        await page.getByText('Read the explanation', { exact: true }).click();
        assert.equal(await page.locator('.film-transcript li').count(), examples[problem.id][0].film.frames.length);
        await page.locator('.film-transcript button').last().click();
        await page.getByText('Read the explanation', { exact: true }).click();
        await page.getByRole('button', { name: 'Restart animation', exact: true }).click();
        // Tab navigation and transport must leave the outer document alone.
        await page.evaluate(() => window.scrollTo(0, 20));
        const before = await page.evaluate(() => scrollY);
        await page.getByRole('button', { name: 'Next scene', exact: true }).click();
        assert.equal(await page.evaluate(() => scrollY), before);
        await page.getByRole('tab', { name: 'Understand', exact: true }).click();
        assert.equal(await page.evaluate(() => scrollY), before);
        await page.getByRole('tab', { name: 'Play', exact: true }).click();
        await page.getByRole('button', { name: 'Next scene', exact: true }).click();
        await noOverflow(route);
        if ([1440, 390].includes(viewport.width)) await page.screenshot({ path: `screenshots/problems-${problem.id}-${viewport.width}.png`, fullPage: true });
      }
    }
    console.log(`${viewport.width}px: all three problem lessons, alternate examples, controls, transcript, tabs and sharp corners passed.`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${origin}/#/problems/two-pointers/two-sum/play`);
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  await page.getByRole('button', { name: 'Next scene', exact: true }).click();
  assert.match(await page.locator('.film-scene-caption').innerText(), /faded endpoint/);
  await page.goto(`${origin}/#/home`);
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox', { name: 'Search topics', exact: true }).fill('3-sum play');
  await page.locator('.site-search-result').first().waitFor();
  assert.equal(await page.locator('.site-search-result').first().getAttribute('href'), '#/problems/two-pointers/three-sum/play');
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
