import assert from 'node:assert/strict';
import { playFilms, conceptVariants, sceneAt, chaptersFor } from '../src/play-models.js';

for (const film of [...Object.values(playFilms), ...Object.values(conceptVariants).flatMap(choices => choices.map(choice => choice.film))]) {
  assert.ok(film.duration > 0 && film.duration < 100, `${film.id}: keep the explanation short`);
  assert.equal(sceneAt(film, 0).index, 0);
  assert.equal(sceneAt(film, film.duration).index, film.frames.length - 1);
  for (const scene of film.frames) {
    assert.equal(new Set(scene.tokens.map(t => t.id)).size, scene.tokens.length, `${film.id}: duplicate object identity`);
    assert.ok(scene.duration >= 3.2, 'Captions need reading time');
    for (const t of scene.tokens) assert.ok(Number.isFinite(t.x) && Number.isFinite(t.y));
    // Concept rows must leave room for the actual square cells at both sizes.
    if (['telescoping', 'master', 'space-balanced', 'space-unbalanced'].some(id => film.id.startsWith(id))) {
      for (const height of [246, 260]) {
        for (let i = 0; i < scene.tokens.length; i++) {
          const a = scene.tokens[i];
          for (const b of scene.tokens.slice(i + 1)) {
            if (a.x !== b.x || a.y === b.y) continue;
            const size = token => token.small ? 34 : token.cellSize ?? 68;
            assert.ok(Math.abs(a.y - b.y) * height > (size(a) + size(b)) / 2,
              `${film.id}: overlapping concept rows`);
          }
        }
      }
    }
  }
  for (const chapter of chaptersFor(film)) assert.equal(sceneAt(film, chapter.time + 0.001).scene.chapter, chapter.title);
}
for (const id of ['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting']) {
  const film = playFilms[id];
  const final = [...film.frames.at(-1).tokens].sort((a, b) => a.x - b.x);
  const values = final.map(t => Number(t.value));
  assert.deepEqual(values, [...values].sort((a, b) => a - b), `${id}: incorrect sorted result`);
  const original = film.frames[0].tokens.filter(t => !t.id.startsWith('bucket')).map(t => t.id).sort();
  assert.deepEqual(final.map(t => t.id).sort(), original, `${id}: an input item was lost or duplicated`);
  if (id !== 'counting') for (const scene of film.frames) assert.deepEqual(scene.tokens.map(t => t.id).sort(), original, `${id}: missing held item`);
}
const finalCount = [...playFilms.counting.frames.at(-1).tokens].sort((a, b) => a.x - b.x);
for (const value of ['1', '2']) {
  const ids = finalCount.filter(t => t.value === value).map(t => Number(t.id.slice(1)));
  assert.deepEqual(ids, [...ids].sort((a, b) => a - b), 'Counting must preserve equal-item order');
}
const shellMoves = playFilms.shell.frames.filter(f => f.chapter === 'Shift');
assert.equal(shellMoves.length, 2);
assert.equal(shellMoves[1].tokens.find(t => t.id === 'v4').x, 0.5 / 6, 'Held key 0 must reach index 0');
console.log('Play models: seven sorted results, item conservation, stable counting, shell group movement, concept spacing, and all visualization variants passed.');
