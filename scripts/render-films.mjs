// Local asset generation. The same renderer serves the interactive player and video.
// Requires the dev server; never uploads source material or publishes anything.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { playFilms, conceptVariants } from '../src/play-models.js';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const selectedIds = process.argv.slice(2);
const allFilms = new Map([...Object.values(playFilms), ...Object.values(conceptVariants).flatMap(choices => choices.map(choice => choice.film))].map(film => [film.id, film]));
const films = [...allFilms.values()].filter(f => !selectedIds.length || selectedIds.includes(f.id));
const directory = new URL('../public/films/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  // Two concurrent captures keep each movie smooth on modest student laptops.
  const queue = [...films];
  await Promise.all(Array.from({ length: 2 }, async () => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 896 } });
    // Keep the recording on the server's origin without loading the app or its
    // live-reload client. Saving another film must not navigate an active capture.
    await page.route(new URL('/', origin).href, route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><head><title>Film recorder</title></head><body></body></html>'
    }));
    await page.goto(origin);
    while (queue.length) {
      const film = queue.shift();
      console.log(`Rendering ${film.id}: ${Math.ceil(film.duration)} seconds`);
      const video = await page.evaluate(async ({ id }) => {
        const { playFilms, conceptVariants } = await import('/src/play-models.js');
        const { renderFilm } = await import('/src/play-renderer.js');
        const film = playFilms[id] || Object.values(conceptVariants).flat().find(v => v.id === id).film;
        const canvas = document.createElement('canvas');
        canvas.width = 1600; canvas.height = 896;
        await document.fonts.ready;
        renderFilm(canvas, film, 0, { exportVideo: true });
        const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8'].find(t => MediaRecorder.isTypeSupported(t));
        if (!type) throw new Error('This browser does not support WebM recording.');
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 5_000_000 });
        const chunks = [];
        const result = new Promise((resolve, reject) => {
          recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
          recorder.onerror = reject;
          recorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            const blob = new Blob(chunks, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          };
        });
        recorder.start(1000);
        const start = performance.now();
        const tick = now => {
          const seconds = (now - start) / 1000;
          renderFilm(canvas, film, Math.min(seconds, film.duration), { exportVideo: true });
          if (seconds < film.duration + 0.6) requestAnimationFrame(tick);
          else recorder.stop();
        };
        requestAnimationFrame(tick);
        return result;
      }, { id: film.id });
      await writeFile(new URL(`${film.id}.webm`, directory), Buffer.from(video, 'base64'));
      console.log(`Saved ${film.id}.webm`);
    }
    await page.close();
  }));
} finally { await browser.close(); }
