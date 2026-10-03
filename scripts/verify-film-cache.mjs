import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { allFilms, fingerprint, cacheKey, planFilms, storeFilm, saveManifest, readManifest, renderSignature } from './film-cache.mjs';

const temporary = await mkdtemp(resolve(tmpdir(), 'dsa-film-cache-'));
const directory = pathToFileURL(temporary + sep);
const films = allFilms.slice(0, 3), signature = 'test-renderer';
const video = Buffer.alloc(2048, 7);
video.set([0x1a, 0x45, 0xdf, 0xa3]);
try {
  let plan = await planFilms(films, directory, signature);
  assert.equal(plan.pending.length, 3, 'A cold cache renders every requested film');
  for (const film of films) await storeFilm(directory, plan.manifest, film, signature, video);
  await saveManifest(directory, plan.manifest);
  plan = await planFilms(films, directory, signature);
  assert.equal(plan.pending.length, 0, 'An unchanged cache reuses every film');
  assert.equal(plan.reused.length, 3);

  const changed = structuredClone(films);
  changed[1].frames[0].caption += ' Edited explanation.';
  plan = await planFilms(changed, directory, signature);
  assert.deepEqual(plan.pending.map(item => item.film.id), [films[1].id], 'Only an edited film is regenerated');
  assert.equal((await planFilms(films, directory, 'changed-renderer')).pending.length, 3, 'Shared renderer changes invalidate all films');
  assert.equal((await planFilms(films, directory, signature, { force: true })).pending.length, 3);
  assert.equal(cacheKey(films, signature), cacheKey([...films].reverse(), signature), 'Registry order does not invalidate the cache');
  assert.notEqual(cacheKey(films, signature), cacheKey(changed, signature));
  assert.notEqual(fingerprint(films[0], signature), fingerprint(films[0], 'changed-capture-settings'));

  const firstVideo = new URL(`${films[0].id}.webm`, directory);
  await rm(firstVideo);
  plan = await planFilms(films, directory, signature);
  assert.deepEqual(plan.pending.map(item => item.reason), ['video missing']);
  await storeFilm(directory, plan.manifest, films[0], signature, video);
  const corrupt = Buffer.from(video);
  corrupt[100] ^= 1;
  await writeFile(firstVideo, corrupt);
  assert.equal((await planFilms(films, directory, signature)).pending[0].reason, 'video checksum failed', 'Same-size corruption must be detected');
  await storeFilm(directory, plan.manifest, films[0], signature, video);
  await writeFile(firstVideo, video.subarray(0, 1200));
  assert.equal((await planFilms(films, directory, signature)).pending[0].reason, 'video checksum failed');
  await storeFilm(directory, plan.manifest, films[0], signature, video);
  assert.equal((await planFilms(films, directory, signature)).pending.length, 0, 'Repair restores reuse');
  await assert.rejects(storeFilm(directory, plan.manifest, films[0], signature, Buffer.alloc(2048)), /Invalid WebM/);
  await assert.rejects(storeFilm(directory, plan.manifest, { ...films[0], id: '../escape' }, signature, video), /Invalid film id/);

  const manifestFile = new URL('.render-manifest.json', directory);
  await writeFile(manifestFile, '{incomplete');
  assert.equal((await planFilms(films, directory, signature)).pending.length, 3, 'Malformed metadata fails safely to a cold render');
  await writeFile(manifestFile, JSON.stringify({ version: 999, films: plan.manifest.films }));
  assert.deepEqual((await readManifest(directory)).films, {});
  await writeFile(manifestFile, 'null');
  assert.deepEqual((await readManifest(directory)).films, {});
  assert.equal((await renderSignature()).length, 64);

  const cli = new URL('./render-films.mjs', import.meta.url);
  const key = spawnSync(process.execPath, [fileURLToPath(cli), '--cache-key'], { encoding: 'utf8' });
  assert.equal(key.status, 0, key.stderr);
  assert.match(key.stdout.trim(), /^[a-f0-9]{64}$/, 'CI output is a plain fingerprint, not log text');
  console.log('Film cache passed: cold/warm, per-film edits, shared dependencies, missing/corrupt files, repair, force, and malformed metadata.');
} finally {
  assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep));
  await rm(temporary, { recursive: true, force: true });
}
