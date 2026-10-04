import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { playFilms } from '../src/algorithms/selection/film.ts';
import { describeScene } from '../src/algorithms/selection/components/play/model.ts';

const film = playFilms.selection;
assert.equal(describeScene(film.frames[0], 0, film.frames.length).minimum, '4');
assert.equal(describeScene(film.frames[1], 1, film.frames.length).minimum, '1');
assert.deepEqual(film.frames[0].tokens.map(token => token.id), film.frames[1].tokens.map(token => token.id), 'Updating the minimum must not rearrange the array');
const completed = describeScene(film.frames.at(-1), film.frames.length - 1, film.frames.length);
assert.equal(completed.minimum, null);
assert.equal(completed.phase, 'Sorted');

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const directory = new URL('../screenshots/selection-play-trial/', import.meta.url);
await mkdir(directory, { recursive: true });
const errors = [];
try {
  for (const width of [1440, 900, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/#/algorithms/selection/play`);
    const player = page.locator('.selection-play');
    await player.waitFor();
    assert.equal(await player.locator('.more').getAttribute('open'), null);
    assert.equal(await player.getByRole('button', { name: 'Restart animation', exact: true }).isVisible(), true);
    await player.getByRole('link', { name: 'Open video', exact: true }).waitFor();
    assert.equal(await player.locator('.film-controls a').count(), 1, 'The video link belongs in the control bar');
    const pair = await player.locator('.direction-controls button').evaluateAll(buttons => buttons.map(button => ({
      label: button.getAttribute('aria-label'), x: button.getBoundingClientRect().x, y: button.getBoundingClientRect().y,
    })));
    assert.deepEqual(pair.map(button => button.label), ['Reverse playback', 'Restart animation']);
    assert.ok(pair[1].x > pair[0].x && pair[1].y === pair[0].y, 'Restart remains to the right of Reverse at every width');
    assert.ok(await player.locator('.film-controls button, .film-controls a, .film-controls select').evaluateAll(controls => controls.every(control => control.title && control.getAttribute('aria-label'))), 'Icon controls need tooltips and accessible labels');
    assert.equal(await player.locator('.film-chapters, .film-heading').count(), 0, 'No repeated headers or chapter strips');
    const initial = await player.locator('.scene-heading h2').innerText();
    await player.getByLabel('Next scene', { exact: true }).click();
    assert.notEqual(await player.locator('.scene-heading h2').innerText(), initial);
    assert.ok((await player.locator('.minimum').innerText()).includes('1'));
    await player.getByLabel('Previous scene', { exact: true }).click();
    assert.equal(await player.locator('.scene-heading h2').innerText(), initial);
    await player.getByLabel('Playback speed').selectOption('3');
    await player.getByLabel('Play animation', { exact: true }).click();
    await page.waitForTimeout(500);
    await player.getByLabel('Pause animation', { exact: true }).click();
    const forward = Number(await player.getByLabel('Seek animation').inputValue());
    await player.getByLabel('Reverse playback', { exact: true }).click();
    await player.getByLabel('Play animation', { exact: true }).click();
    await page.waitForTimeout(200);
    await player.getByLabel('Pause animation', { exact: true }).click();
    assert.ok(Number(await player.getByLabel('Seek animation').inputValue()) < forward);
    await player.getByText('Read the explanation', { exact: true }).click();
    assert.equal(await player.locator('.film-transcript li').count(), film.frames.length);
    await player.getByLabel('Restart animation', { exact: true }).click();
    await player.getByLabel('Reverse playback', { exact: true }).click();
    await player.getByLabel('Restart animation', { exact: true }).click();
    await player.getByText('Read the explanation', { exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const controls = await player.locator('.film-controls').evaluate(el => {
      const bounds = el.getBoundingClientRect();
      return [...el.querySelectorAll('button, select, a')].map(control => {
        const rect = control.getBoundingClientRect();
        return rect.width >= 40 && rect.height >= 40 && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
      });
    });
    assert.ok(controls.every(Boolean), 'Controls should remain touchable and within their container');
    await player.screenshot({ path: fileURLToPath(new URL(`selection-${width}.png`, directory)) });
    // Merge now shares the same player pattern without Selection-specific facts.
    await page.goto(`${origin}/#/algorithms/merge/play`);
    await page.locator('.scene-heading').waitFor();
    assert.equal(await page.locator('.selection-play').count(), 0);
    await page.close();
    console.log(`${width}px: concise Selection player, seek, reverse, detail disclosure, and consistent Merge player passed.`);
  }
  assert.deepEqual(errors, [], 'Runtime errors');
} finally { await browser.close(); }
