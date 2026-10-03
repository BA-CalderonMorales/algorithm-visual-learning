import { createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { playFilms, conceptVariants, sceneAt } from '../src/play-models.js';

const version = 1;
export const filmsDirectory = new URL('../public/films/', import.meta.url);
export const allFilms = [...new Map([
  ...Object.values(playFilms),
  ...Object.values(conceptVariants).flatMap(choices => choices.map(choice => choice.film)),
].map(film => [film.id, film])).values()];
export const digest = value => createHash('sha256').update(value).digest('hex');

export async function renderSignature() {
  // These are the complete canvas renderer dependencies. Narration and site UI
  // are deliberately excluded: exported films do not use either of them.
  const paths = ['src/play-renderer.js', 'src/sorting-play-renderer.js',
    'src/play-drawing.js', 'scripts/render-films.mjs', 'scripts/film-cache.mjs', 'package-lock.json'];
  const sources = await Promise.all(paths.map(async path => [path,
    (await readFile(new URL(`../${path}`, import.meta.url), 'utf8')).replaceAll('\r\n', '\n')]));
  // Model changes are captured per film below. sceneAt is the only model
  // function the renderer calls directly, so its implementation also matters.
  return digest(JSON.stringify([version, sources, sceneAt.toString().replaceAll('\r\n', '\n')]));
}

export const fingerprint = (film, signature) => digest(JSON.stringify([signature, film]));
export const cacheKey = (films, signature) => digest(JSON.stringify(films
  .map(film => [film.id, fingerprint(film, signature)]).sort(([a], [b]) => a.localeCompare(b))));

const manifestPath = directory => new URL('.render-manifest.json', directory);
export async function readManifest(directory) {
  try {
    const manifest = JSON.parse(await readFile(manifestPath(directory), 'utf8'));
    return manifest?.version === version && manifest.films && typeof manifest.films === 'object' && !Array.isArray(manifest.films)
      ? manifest : { version, films: {} };
  } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
    return { version, films: {} };
  }
}

function videoPath(directory, id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid film id: ${id}`);
  return new URL(`${id}.webm`, directory);
}
function validWebM(bytes) {
  return bytes.length > 1024 && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
}
export async function planFilms(films, directory, signature, { force = false } = {}) {
  const manifest = await readManifest(directory);
  const reused = [], pending = [];
  for (const film of films) {
    const expected = fingerprint(film, signature), record = manifest.films[film.id];
    let reason = force ? 'forced' : !record ? 'not cached' : record.fingerprint !== expected ? 'render inputs changed' : null;
    if (!reason) {
      try {
        const bytes = await readFile(videoPath(directory, film.id));
        if (!validWebM(bytes) || bytes.length !== record.bytes || digest(bytes) !== record.sha256) reason = 'video checksum failed';
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        reason = 'video missing';
      }
    }
    if (reason) pending.push({ film, reason });
    else reused.push(film);
  }
  return { manifest, reused, pending };
}

export async function storeFilm(directory, manifest, film, signature, bytes) {
  if (!validWebM(bytes)) throw new Error(`Invalid WebM recording: ${film.id}`);
  const target = videoPath(directory, film.id), temporary = new URL(`${film.id}.webm.tmp`, directory);
  await writeFile(temporary, bytes);
  await rename(temporary, target);
  manifest.films[film.id] = { fingerprint: fingerprint(film, signature), bytes: bytes.length, sha256: digest(bytes) };
}
export async function saveManifest(directory, manifest) {
  const temporary = new URL('.render-manifest.json.tmp', directory);
  await writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n');
  await rename(temporary, manifestPath(directory));
}
