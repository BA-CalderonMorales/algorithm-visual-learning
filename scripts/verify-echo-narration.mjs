import assert from 'node:assert/strict';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { playFilms } from '../src/app/film-catalog.ts';
import { sortingNarration, narrationSource } from '../src/algorithms/play/narration.ts';

const recordings = JSON.parse(await readFile(new URL('../src/algorithms/play/narration-clips.json', import.meta.url)));
const ids = Object.keys(sortingNarration);
assert.equal(recordings.voice, 'am_echo');
for (const id of ids) {
  assert.equal(recordings.algorithms[id].length, playFilms[id].frames.length);
  for (const [i, clip] of recordings.algorithms[id].entries()) {
    assert.equal(clip.text, sortingNarration[id][i].text);
    assert.equal(clip.source, narrationSource(playFilms[id].frames[i]), `${id}/${i}: regenerate audio after model changes`);
    assert.ok(clip.text.split(/\s+/).length <= 45, 'Keep each scene focused and conversational');
    assert.ok(clip.duration > 1 && clip.duration < 25);
    assert.equal((await stat(new URL(`../public/${clip.url}`, import.meta.url))).size, clip.bytes);
  }
}
console.log('All 98 recordings match their authored scripts, film states and static files.');

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const errors = [];
await mkdir(new URL('../screenshots/echo-review/', import.meta.url), { recursive: true });
try {
  const decode = await browser.newPage();
  await decode.goto(`${origin}/#/algorithms/merge/play`);
  const checks = await decode.evaluate(async clips => {
    const context = new OfflineAudioContext(1, 1, 24000);
    const results = [];
    for (const clip of clips) {
      const response = await fetch(`/${clip.url}`);
      if (!response.ok || !response.headers.get('content-type')?.includes('audio')) throw new Error(`Not audio: ${clip.url}`);
      const decoded = await context.decodeAudioData(await response.arrayBuffer());
      const samples = decoded.getChannelData(0);
      let sum = 0, count = 0;
      for (let i = 0; i < samples.length; i += 20) { sum += samples[i] ** 2; count++; }
      results.push({ url: clip.url, duration: decoded.duration, rms: Math.sqrt(sum / count), expected: clip.duration });
    }
    return results;
  }, Object.values(recordings.algorithms).flat());
  for (const check of checks) {
    assert.ok(check.rms > 0.0001, `Silent audio: ${check.url}`);
    assert.ok(Math.abs(check.duration - check.expected) < 0.15, `Incorrect timing metadata: ${check.url}`);
  }
  console.log('Every MP3 decodes, contains non-silent audio and has correct duration metadata.');
  await decode.close();

  // Deterministic media events test synchronization; real decoding is checked above.
  for (const width of [1440, 900, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.recordedAudio = [];
      class ControlledAudio {
        constructor(url) { this.url = url; this.currentTime = 0; this.duration = 10; this.playCalls = 0; recordedAudio.push(this); }
        play() { this.playCalls++; this.paused = false; queueMicrotask(() => this.onplaying?.()); return Promise.resolve(); }
        pause() { this.paused = true; }
        removeAttribute() {}
        load() {}
      }
      window.Audio = ControlledAudio;
      Object.defineProperty(window, 'speechSynthesis', { value: undefined });
    });
    for (const id of ids) {
      await page.goto(`${origin}/#/algorithms/${id}/play`);
      await page.evaluate(() => { recordedAudio.length = 0; });
      const voice = page.getByRole('button', { name: 'Voice narration', exact: true });
      await voice.waitFor();
      assert.equal(await voice.getAttribute('aria-pressed'), 'false');
      assert.equal(await page.evaluate(() => recordedAudio.length), 0, 'Do not autoplay or preload audio before opting in');
      await voice.click();
      await page.getByLabel('Playback speed', { exact: true }).selectOption('3');
      await page.getByRole('button', { name: 'Play animation', exact: true }).click();
      await page.waitForFunction(() => recordedAudio.length === 1);
      await page.waitForTimeout(160);
      assert.equal(await page.evaluate(() => recordedAudio[0].playbackRate), 3);
      assert.ok((await page.locator('.film-scene-caption').innerText()).includes(recordings.algorithms[id][0].text));
      await page.getByRole('button', { name: 'Pause animation', exact: true }).click();
      const before = Number(await page.getByLabel('Seek animation', { exact: true }).inputValue());
      await page.evaluate(() => { recordedAudio[0].currentTime = 2; });
      await page.getByLabel('Playback speed', { exact: true }).selectOption('2.5');
      assert.equal(await page.evaluate(() => recordedAudio[0].currentTime), 2);
      await page.getByRole('button', { name: 'Play animation', exact: true }).click();
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => recordedAudio.length), 1, 'Pause resumes, not repeats');
      assert.ok(Number(await page.getByLabel('Seek animation', { exact: true }).inputValue()) >= before);
      await page.getByRole('button', { name: 'Next scene', exact: true }).click();
      assert.ok(await page.getByRole('button', { name: 'Play animation', exact: true }).isVisible());
      await page.getByRole('button', { name: 'Replay narration', exact: true }).click();
      await page.waitForFunction(() => recordedAudio.at(-1).url.includes('/02-'));
      await page.getByRole('button', { name: 'Reverse playback', exact: true }).click();
      assert.ok((await page.locator('.film-voice-status').innerText()).includes('quiet during reverse'));
      const count = await page.evaluate(() => recordedAudio.length);
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => recordedAudio.length), count);
      await page.getByRole('button', { name: 'Reverse playback', exact: true }).click();
      await page.getByRole('button', { name: 'Replay narration', exact: true }).click();
      await page.evaluate(() => recordedAudio.at(-1).onerror());
      assert.equal(await voice.getAttribute('aria-pressed'), 'false');
      assert.ok((await page.locator('.film-voice-status').innerText()).includes('Visuals continue'));
      await page.getByRole('button', { name: 'Pause animation', exact: true }).click();
      await voice.click();
      await page.getByRole('button', { name: 'Replay narration', exact: true }).click();
      const seek = page.getByLabel('Seek animation', { exact: true });
      await seek.evaluate(element => { element.value = '0'; element.dispatchEvent(new Event('input', { bubbles: true })); });
      assert.ok(await page.getByRole('button', { name: 'Play animation', exact: true }).isVisible());
      assert.ok(await page.evaluate(() => recordedAudio.at(-1).paused), 'Seeking stops the old recording');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${id}: overflow at ${width}px`);
      if (id === 'merge') await page.locator('.concept-film').screenshot({ path: fileURLToPath(new URL(`../screenshots/echo-review/merge-${width}.png`, import.meta.url)) });
      await page.getByRole('button', { name: 'Replay narration', exact: true }).click();
      await page.evaluate(() => { location.hash = '/complexity/space/visualize'; });
      await page.waitForFunction(() => !document.querySelector('.film-narration'));
      assert.ok(await page.evaluate(() => recordedAudio.at(-1).paused), 'Leaving an algorithm stops its recording');
    }
    console.log(`${width}px: all seven Play players passed pause, rate, replay, reverse, seek, route and error recovery checks.`);
    await page.close();
  }

  const real = await browser.newPage();
  real.on('pageerror', error => errors.push(error.message));
  const apiRequests = [];
  real.on('request', request => { if (request.url().includes(':13305') || request.url().includes('api.openai')) apiRequests.push(request.url()); });
  for (const id of ids) {
    await real.goto(`${origin}/#/algorithms/${id}/play`);
    await real.getByRole('button', { name: 'Voice narration', exact: true }).click();
    await real.getByRole('button', { name: 'Play animation', exact: true }).click();
    await real.waitForFunction(() => document.querySelector('.film-voice-status')?.textContent.includes('Listening'));
    await real.getByRole('button', { name: 'Pause animation', exact: true }).click();
  }
  assert.deepEqual(apiRequests, [], 'Playback must never require a TTS server or API key');
  await real.close();
  console.log('Real Chromium audio playback starts on every algorithm without a speech service.');

  const server = await preview({ preview: { host: '127.0.0.1', port: 5189, strictPort: true } });
  try {
    const production = await browser.newPage();
    await production.goto('http://127.0.0.1:5189/algorithm-visual-learning/#/algorithms/merge/play');
    const clip = recordings.algorithms.merge[0];
    const response = await production.request.get(`http://127.0.0.1:5189/algorithm-visual-learning/${clip.url}`);
    assert.ok(response.ok() && response.headers()['content-type'].includes('audio'), 'GitHub Pages base path must serve the recording');
    await production.getByRole('button', { name: 'Voice narration', exact: true }).click();
    await production.getByRole('button', { name: 'Play animation', exact: true }).click();
    await production.waitForFunction(() => document.querySelector('.film-voice-status')?.textContent.includes('Listening'));
    await production.close();
    console.log('Production build plays Echo using the GitHub Pages subdirectory.');
  } finally { await new Promise(resolve => server.httpServer.close(resolve)); }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally { await browser.close(); }
