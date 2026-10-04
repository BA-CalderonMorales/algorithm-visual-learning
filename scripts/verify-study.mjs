import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { studyLessons, lessonTabs, lessonHref } from '../src/app/study-catalog.ts';
import { conceptVariants } from '../src/app/film-catalog.ts';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir(new URL('../screenshots/', import.meta.url), { recursive: true });
try {
  for (const viewport of [{width:1440,height:1000}, {width:900,height:900}, {width:390,height:844}]) {
    await page.setViewportSize(viewport);
    for (const route of ['#/home', '#/home/resources', '#/home/author', '#/discrete', '#/complexity']) {
      await page.goto(`${origin}/${route}`);
      await page.locator('main .hero-collapsed-strip').waitFor();
      assert.equal(await page.locator('main h1').count(), 0, 'Introductions start collapsed');
      await page.getByRole('button', {name:'Show intro',exact:false}).click();
      await page.locator('main h1').waitFor();
      await page.getByRole('button', {name:'Hide intro',exact:false}).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow: ${route} at ${viewport.width}`);
    }
    for (const lesson of Object.values(studyLessons)) {
      for (const tab of lessonTabs) {
        await page.goto(`${origin}/${lessonHref(lesson, tab.id)}`);
        await page.getByRole('tab', {name:tab.label, exact:true}).waitFor();
        assert.equal(await page.getByRole('tab', {name:tab.label, exact:true}).getAttribute('aria-selected'), 'true');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow: ${lesson.id}/${tab.id} at ${viewport.width}`);
        assert.ok(await page.locator('.study-panel').evaluate(el => el.clientHeight <= 800), 'Lessons must remain bounded');
        if (tab.id === 'examples') {
          for (const example of lesson.examples) {
            await page.getByRole('button', {name:example.title}).click();
            await page.locator('.study-lead h2').filter({hasText:example.title}).waitFor();
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
          }
        }
        if (tab.id === 'visualize' && lesson.id === 'asymptotic') {
          const choices = page.locator('.ratio-choices button');
          assert.equal(await choices.count(), lesson.comparisons.length);
          for (let index = 0; index < lesson.comparisons.length; index++) {
            await choices.nth(index).click();
            assert.equal(await choices.nth(index).getAttribute('aria-pressed'), 'true');
            await page.locator('svg.ratio-chart').waitFor();
          }
        }
        if (tab.id === 'visualize' && lesson.id !== 'asymptotic') {
          const picker = page.getByLabel(lesson.id === 'master' ? 'Recurrence' : 'Visualization example', {exact:true});
          assert.equal(await picker.locator('option').count(), 3);
          for (const choice of conceptVariants[lesson.id]) {
            await picker.selectOption(choice.id);
            await page.locator('.scene-heading h2').filter({hasText:choice.film.frames[0].title}).waitFor();
            assert.equal(await page.getByLabel('Seek animation', {exact:true}).inputValue(), '0');
            await page.getByLabel('Playback speed', {exact:true}).selectOption('3');
            await page.getByRole('button', {name:'Play animation',exact:true}).click();
            await page.waitForTimeout(250);
            await page.getByRole('button', {name:'Pause animation',exact:true}).click();
            assert.ok(Number(await page.getByLabel('Seek animation', {exact:true}).inputValue()) > 0.3);
          }
        }
      }
    }
    console.log(`Study lessons: all views, examples, and variants passed at ${viewport.width}px.`);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${origin}/#/discrete/telescoping/understand`);
  await page.locator('.study-panel').waitFor();
  await page.waitForTimeout(150); // Let new-topic navigation's two animation frames finish.
  // Keep the clicked tab below the sticky header. Otherwise Playwright scrolls
  // an obscured tab into view before clicking, independently of our routing.
  await page.evaluate(() => window.scrollTo(0, 35));
  const before = await page.evaluate(() => scrollY);
  assert.ok(before > 0, 'Exercise a real scroll offset, not a viewport that already fits');
  await page.getByRole('tab', {name:'Examples',exact:true}).click();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => scrollY), before, 'Switching views should not jump the page');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({path:'screenshots/telescoping-examples-local.png',fullPage:true});
  await page.getByRole('tab', {name:'Visualize',exact:true}).click();
  await page.getByText('Read the explanation', { exact: true }).click();
  await page.locator('.film-transcript button').nth(1).click();
  assert.equal(await page.locator('.scene-meta .phase').innerText(), 'Cancel');
  await page.waitForTimeout(1000);
  await page.screenshot({path:'screenshots/telescoping-visual-local.png',fullPage:true});
  await page.goto(`${origin}/#/home`);
  await page.locator('.home-panel').waitFor();
  await page.waitForTimeout(150);
  await page.screenshot({path:'screenshots/study-home-local.png',fullPage:true});
  assert.deepEqual(errors, [], 'Runtime errors');
} finally { await browser.close(); }
