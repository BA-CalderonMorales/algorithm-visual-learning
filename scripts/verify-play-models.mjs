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
const countingStates = playFilms.counting.frames.map(scene => scene.counting);
assert.deepEqual(countingStates.find(state => state.phase === 'frequencies').counts, [1, 2, 2, 1]);
assert.deepEqual(countingStates.find(state => state.phase === 'ranges').ends, [1, 3, 5, 6]);
for (const [index, state] of countingStates.entries()) {
  assert.equal(state.input.length, 6, 'Input storage must stay visible and fixed');
  assert.equal(state.output.length, 6, 'Output storage must stay visible and fixed');
  if (state.phase === 'count') assert.equal(state.after, state.before + 1);
  if (state.phase === 'prefix') assert.equal(state.after, state.before + state.addend);
  if (state.phase === 'place') {
    assert.equal(state.target, state.before - 1, 'Placement decrements the cumulative end before writing');
    assert.equal(countingStates[index - 1].output[state.target], null, 'Placement must use an empty slot');
    assert.equal(state.output[state.target].id, state.input[state.activeInput].id);
    assert.equal(state.output[state.target].sourceIndex, state.activeInput);
  }
}
for (const value of ['1', '2']) {
  const ids = finalCount.filter(t => t.value === value).map(t => Number(t.id.slice(1)));
  assert.deepEqual(ids, [...ids].sort((a, b) => a - b), 'Counting must preserve equal-item order');
}
const shellMoves = playFilms.shell.frames.filter(f => f.chapter === 'Shift');
assert.equal(shellMoves.length, 2);
assert.equal(shellMoves[1].tokens.find(t => t.id === 'v4').x, 0.5 / 6, 'Held key 0 must reach index 0');
for (const id of ['merge','tim']) {
  const scenes=playFilms[id].frames;
  for (let index=0; index<scenes.length; index++) {
    const state=scenes[index].merge;
    assert.equal(state.left.length,3,'Source row must keep its fixed slots');
    assert.equal(state.right.length,3,'Source row must keep its fixed slots');
    assert.equal(state.output.length,6,'Merge output must keep its fixed slots');
    if(state.phase!=='place')continue;
    const previous=scenes[index-1].merge;
    const left=state.left[previous.leftUsed],right=state.right[previous.rightUsed];
    const expected=!right || left && Number(left.value)<=Number(right.value)?left:right;
    assert.equal(state.chosenId,expected.id,'Choose the smaller unused front');
    assert.equal(previous.output[state.target],null,'Write into the next empty output slot');
    assert.equal(state.output[state.target].id,state.chosenId);
    for(const source of ['left','right'])assert.equal(state[`${source}Used`],previous[`${source}Used`]+(source===state.source?1:0),'Advance only the selected source');
  }
}
const fixedPositions=new Map();
for(const scene of playFilms.quick.frames) {
  for(const [position,id] of fixedPositions)assert.equal(scene.tokens[position].id,id,'A fixed quick-sort pivot must never move again');
  for(const position of scene.fixed??[])fixedPositions.set(position,scene.tokens[position].id);
}
console.log('Play models: seven sorted results, item conservation, stable counting, shell group movement, concept spacing, and all visualization variants passed.');
