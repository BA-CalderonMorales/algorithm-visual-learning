import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { playFilms, conceptVariants } from '../src/app/film-catalog.ts';
import { stageBounds } from '../src/shared/playback/player/model.ts';

// Every exported diagram must fit inside its live-player crop. Film headers,
// fact cards and captions intentionally live outside these diagram bounds.
for (const compact of [false, true]) {
  for (const film of Object.values(conceptVariants).flatMap(choices => choices.map(choice => choice.film))) {
    for (const scene of film.frames) {
      const bounds = stageBounds(film.id, scene, compact);
      const top = compact ? 137 : 122, height = compact ? 260 : 246;
      for (const token of scene.tokens) {
        const half = token.small ? 17 : Math.min(compact ? 58 : 68, token.cellSize ?? 68) / 2;
        const y = top + token.y * height;
        assert.ok(y - half >= bounds.top && y + half <= bounds.top + bounds.height, `${film.id}: token outside diagram crop`);
      }
      for (const text of scene.texts ?? []) {
        const y = top + text.y * height, half = (compact ? 20 : 26) * (text.size || 1) / 2;
        assert.ok(y - half >= bounds.top && y + half <= bounds.top + bounds.height, `${film.id}: annotation outside diagram crop`);
      }
    }
  }
  for (const id of ['merge', 'tim']) {
    assert.equal(new Set(playFilms[id].frames.map(scene => stageBounds(id, scene, compact).height)).size, 1, 'Merge controls need a stable stage height');
  }
}

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const directory = new URL('../screenshots/shared-player-review/', import.meta.url);
await mkdir(directory, { recursive: true });
const routes = ['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting']
  .map(id => ({ id, route: `algorithms/${id}/play`, sorting: true }))
  .concat(['induction', 'telescoping', 'master', 'time', 'space'].map(id => ({
    id, route: `${['time', 'space'].includes(id) ? 'complexity' : 'discrete'}/${id === 'master' ? 'master-theorem' : id}/visualize`, sorting: false,
  })));
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    for (const { id, route, sorting } of routes) {
      await page.goto(`${origin}/#/${route}`);
      const player = page.locator('.concept-film');
      await player.locator('.scene-heading h2').waitFor();
      assert.equal(await player.locator('.film-chapters, .film-heading').count(), 0);
      assert.equal(await player.locator('.more').getAttribute('open'), null);
      assert.equal(await player.locator('.film-transcript li').count(), playFilms[id].frames.length);
      assert.equal(await player.getByLabel('Voice narration', { exact: true }).count(), sorting ? 1 : 0);
      assert.ok(await player.locator('.film-scene-caption').isVisible());
      assert.ok(await player.locator('.film-stage canvas').evaluate(canvas => {
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        return pixels.some((value, index) => index % 4 !== 3 && value > 100);
      }), `Diagram must render: ${id} at ${width}`);
      await player.getByRole('link', { name: 'Open video', exact: true }).waitFor();
      assert.equal(await player.locator('.film-controls a').count(), 1);
      const pair = await player.locator('.direction-controls button').evaluateAll(buttons => buttons.map(button => ({
        label: button.getAttribute('aria-label'), x: button.getBoundingClientRect().x, y: button.getBoundingClientRect().y,
      })));
      assert.deepEqual(pair.map(button => button.label), ['Reverse playback', 'Restart animation']);
      assert.ok(pair[1].x > pair[0].x && pair[1].y === pair[0].y);
      assert.ok(await player.locator('.film-controls').evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return [...element.querySelectorAll('button, select, a')].every(control => {
          const rect = control.getBoundingClientRect();
          return control.title && control.getAttribute('aria-label') && rect.width >= 40 && rect.height >= 40
            && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
        });
      }), `Touchable, labeled controls must fit: ${id} at ${width}`);
      await player.getByLabel('Next scene', { exact: true }).click();
      assert.equal(await player.locator('.scene-heading h2').innerText(), playFilms[id].frames[1].title);
      await player.getByLabel('Previous scene', { exact: true }).click();
      await player.getByText('Read the explanation', { exact: true }).click();
      await player.locator('.film-transcript button').last().click();
      assert.equal(await player.locator('.scene-heading h2').innerText(), playFilms[id].frames.at(-1).title);
      assert.equal(await player.locator('.film-transcript button[aria-current="step"]').count(), 1);
      await player.getByText('Read the explanation', { exact: true }).click();
      await player.getByLabel('Restart animation', { exact: true }).click();
      if (conceptVariants[id]) {
        const picker = player.getByLabel(id === 'master' ? 'Recurrence' : 'Visualization example', { exact: true });
        for (const choice of conceptVariants[id]) {
          await picker.selectOption(choice.id);
          assert.equal(await player.locator('.scene-heading h2').innerText(), choice.film.frames[0].title);
          assert.equal(await player.locator('.film-transcript li').count(), choice.film.frames.length);
          assert.equal(await player.getByLabel('Seek animation').inputValue(), '0');
        }
        await picker.selectOption(conceptVariants[id][0].id);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.locator('.study-visual-scroll').evaluateAll(elements => elements.forEach(element => { element.scrollTop = 0; }));
      await player.screenshot({ path: fileURLToPath(new URL(`${id}-${width}.png`, directory)) });
    }
    console.log(`${width}px: all 12 players share controls, disclosures, touch targets and example behavior.`);
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally { await browser.close(); }
