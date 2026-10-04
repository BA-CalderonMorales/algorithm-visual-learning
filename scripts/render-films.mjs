// Local asset generation. The same renderer serves the interactive player and video.
// Requires the dev server; never uploads source material or publishes anything.
import { chromium } from 'playwright';
import { mkdir, appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { allFilms, filmsDirectory, renderSignature, cacheKey, planFilms, storeFilm, saveManifest } from './film-cache.mjs';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
export async function renderMissingFilms({ films = allFilms, directory = filmsDirectory, previewOrigin = origin, force = false } = {}) {
  const signature = await renderSignature();
  await mkdir(directory, { recursive: true });
  const plan = await planFilms(films, directory, signature, { force });
  console.log(`Films: ${plan.reused.length} reused, ${plan.pending.length} to render.`);
  for (const film of plan.reused) console.log(`Reusing ${film.id}.webm (verified)`);
  if (!plan.pending.length) return { reused: plan.reused.length, rendered: 0 };
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    // Two concurrent captures keep each movie smooth on modest student laptops.
    const queue = [...plan.pending];
    await Promise.all(Array.from({ length: Math.min(2, queue.length) }, async () => {
      const page = await browser.newPage({ viewport: { width: 1600, height: 896 } });
      // Keep the recording on the server's origin without loading the app or its
      // live-reload client. Saving another film must not navigate an active capture.
      await page.route(new URL('/', previewOrigin).href, route => route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html lang="en"><head><title>Film recorder</title></head><body></body></html>'
      }));
      await page.goto(previewOrigin);
      while (queue.length) {
        const { film, reason } = queue.shift();
        console.log(`Rendering ${film.id}: ${Math.ceil(film.duration)} seconds (${reason})`);
        const video = await page.evaluate(async film => {
          const { renderFilm } = await import('/src/shared/playback/renderers/concept.js');
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
        }, film);
        await storeFilm(directory, plan.manifest, film, signature, Buffer.from(video, 'base64'));
        console.log(`Saved ${film.id}.webm`);
      }
      await page.close();
    }));
  } finally { await browser.close(); }
  await saveManifest(directory, plan.manifest);
  return { reused: plan.reused.length, rendered: plan.pending.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.includes('--cache-key')) {
    if (args.length !== 1) throw new Error('--cache-key must be used on its own');
    console.log(cacheKey(allFilms, await renderSignature()));
  } else {
    const selectedIds = args.filter(arg => arg !== '--force');
    for (const id of selectedIds) if (!allFilms.some(film => film.id === id)) throw new Error(`Unknown film: ${id}`);
    const result = await renderMissingFilms({ films: allFilms.filter(film => !selectedIds.length || selectedIds.includes(film.id)), force: args.includes('--force') });
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `rendered=${result.rendered}\nreused=${result.reused}\n`);
  }
}
