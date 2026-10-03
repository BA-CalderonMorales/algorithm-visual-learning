import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';
import { allFilms, digest } from './film-cache.mjs';
import { renderMissingFilms } from './render-films.mjs';

const temporary = await mkdtemp(resolve(tmpdir(), 'dsa-film-rendering-'));
const directory = pathToFileURL(temporary + sep);
// Exercise the real recorder without waiting for full teaching-length movies.
const films = ['selection', 'merge', 'tim'].map(id => {
  const film = structuredClone(allFilms.find(film => film.id === id));
  film.frames = [{ ...film.frames[0], duration: 3.2 }];
  film.duration = 3.2;
  return film;
});
try {
  const start = performance.now();
  assert.deepEqual(await renderMissingFilms({ films, directory }), { reused: 0, rendered: 3 });
  const coldMs = performance.now() - start;
  const snapshots = await Promise.all(films.map(async film => {
    const path = new URL(`${film.id}.webm`, directory);
    return { hash: digest(await readFile(path)), modified: (await stat(path)).mtimeMs };
  }));
  const warmStart = performance.now();
  // No available server: a warm render must not launch a browser or navigate.
  assert.deepEqual(await renderMissingFilms({ films, directory, previewOrigin: 'http://127.0.0.1:1' }), { reused: 3, rendered: 0 });
  const warmMs = performance.now() - warmStart;
  for (let i = 0; i < films.length; i++) {
    const path = new URL(`${films[i].id}.webm`, directory);
    assert.equal(digest(await readFile(path)), snapshots[i].hash);
    assert.equal((await stat(path)).mtimeMs, snapshots[i].modified, 'Reused videos are not rewritten');
  }
  films[1].frames[0].title = 'Edited merge example';
  assert.deepEqual(await renderMissingFilms({ films, directory }), { reused: 2, rendered: 1 });
  const broken = new URL('selection.webm', directory);
  const bytes = await readFile(broken);
  bytes[100] ^= 1;
  await writeFile(broken, bytes);
  assert.deepEqual(await renderMissingFilms({ films, directory }), { reused: 2, rendered: 1 });

  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const page = await browser.newPage();
    for (const film of films) {
      const encoded = (await readFile(new URL(`${film.id}.webm`, directory))).toString('base64');
      const dimensions = await page.evaluate(encoded => new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.onloadeddata = () => resolve([video.videoWidth, video.videoHeight]);
        video.onerror = () => reject(new Error('Recording did not decode'));
        video.src = `data:video/webm;base64,${encoded}`;
      }), encoded);
      assert.deepEqual(dimensions, [1600, 896], 'Regenerated movies must decode at the intended resolution');
    }
  } finally { await browser.close(); }
  console.log(`Real recording cache passed: cold ${Math.round(coldMs)}ms; warm ${Math.round(warmMs)}ms; one-film edits, corruption repair, and video decoding passed.`);
} finally {
  assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep));
  await rm(temporary, { recursive: true, force: true });
}
