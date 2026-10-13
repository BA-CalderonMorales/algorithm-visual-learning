import { exposeSectionTabs } from './expose-section-tabs.mjs';
import { revealAnimation } from './reveal-animation.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { catalogLessons, patterns, catalogHref } from '../src/problems/catalog/model.ts';
import { themes } from '../src/app/components/appearance/model.ts';
import { shellTrace, quickTrace } from '../src/algorithms/components/trace-practice/model.ts';
const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const out = new URL('../../../outputs/learning-preview/', import.meta.url);
await mkdir(out, { recursive: true });
async function bounded() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
}
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pattern of patterns) {
      await page.goto(origin + '/' + pattern.href);
      await revealAnimation(page);
      await page.locator('.problem-list').waitFor();
      assert.ok((await page.locator('.problem-list').innerText()).length > 100);
      await bounded();
    }
    for (const entry of catalogLessons) {
      await page.goto(origin + '/' + catalogHref(entry, 'practice'));
      await revealAnimation(page);
      await page.getByRole('button', { name: 'Check my reasoning', exact: true }).waitFor();
      const offset = entry.id.length % 3,
        correct = (3 - offset) % 3;
      await page.getByRole('radio').nth(correct).check();
      await page.getByRole('button', { name: 'Check my reasoning', exact: true }).click();
      await page.getByRole('status').filter({ hasText: 'That decision holds.' }).waitFor();
      await bounded();
      await exposeSectionTabs(page);
      await page.getByRole('tab', { name: 'Play', exact: true }).click();
      await page.getByRole('button', { name: 'Next decision →', exact: true }).click();
      if (await page.locator('.code-workbench').count())
        assert.match(await page.locator('.trace-meta').innerText(), /Decision 2/);
      else assert.match(await page.locator('.overline').first().innerText(), /2 of 3/);
      await bounded();
    }
    await page.goto(origin + '/#/structures/list-insertion/visualize');
    await revealAnimation(page);
    for (const operation of ['prepend', 'insert', 'append']) {
      await page.getByLabel('Operation', { exact: true }).selectOption(operation);
      await page.getByRole('button', { name: 'Next decision', exact: true }).click();
      await page.getByRole('button', { name: 'Next decision', exact: true }).click();
      await bounded();
    }
    await page.screenshot({
      path: new URL(`nodes-${width}.png`, out).pathname.replace(/^\/([A-Z]:)/, '$1'),
      fullPage: true,
    });
    console.log(`All ${catalogLessons.length} new lessons and 16 directories passed at ${width}px.`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const id of ['shell', 'quick']) {
    await page.goto(origin + `/#/algorithms/${id}/practice`);
    await revealAnimation(page);
    const states = id === 'shell' ? shellTrace([11, 4, 9, 2, 8, 6, 3]) : quickTrace([6, 12, 3, 9, 5, 10, 2]);
    const lab = page.getByRole('region', { name: 'Complete an independent sorting trace' });
    for (let i = 1; i < states.length; i++) {
      const expected = '[' + states[i].values.join(', ') + ']';
      await lab.getByText(expected, { exact: true }).click();
      await lab.getByRole('button', { name: 'Check next state', exact: true }).click();
      await lab.getByRole('button', { name: 'Continue trace →', exact: true }).click();
    }
    await lab.getByRole('status').filter({ hasText: 'Trace complete.' }).waitFor();
  }
  await page.goto(origin + '/#/home');
  await revealAnimation(page);
  for (const theme of themes) {
    await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
    await page.getByRole('menuitemradio', { name: theme.name, exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme.id);
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme.id);
  }
  await page.goto(origin + '/#/problems');
  await revealAnimation(page);
  await page.screenshot({
    path: new URL('patterns-desktop.png', out).pathname.replace(/^\/([A-Z]:)/, '$1'),
    fullPage: true,
  });
  await page.keyboard.press('Control+k');
  await page.getByRole('dialog', { name: 'Search the study guide' }).waitFor();
  await page.locator('.site-search input').fill('pacific atlantic');
  await page.locator('.site-search a[href*="pacific-atlantic"]').first().click();
  await exposeSectionTabs(page);
  await page.getByRole('tab', { name: 'Understand', exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('Fresh sorting traces, persisted themes, search, reduced motion, and browser errors passed.');
} finally {
  await browser.close();
}
