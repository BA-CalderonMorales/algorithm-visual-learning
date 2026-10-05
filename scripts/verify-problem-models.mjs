import assert from 'node:assert/strict';
import { twoSumFilm } from '../src/problems/two-pointers/two-sum.ts';
import { containerFilm } from '../src/problems/two-pointers/container.ts';
import { threeSumFilm } from '../src/problems/two-pointers/three-sum.ts';
import { examples } from '../src/problems/two-pointers/films.ts';
import { parseProblemRoute, problemHref, problems } from '../src/problems/model.ts';
import { sceneAt } from '../src/shared/playback/model.ts';

const key = (triplet) => [...triplet].sort((a, b) => a - b).join(',');
const pairs = (values) => values.flatMap((a, i) => values.slice(i + 1).map((b, offset) => [i, i + 1 + offset, a + b]));
function bruteTriples(values) {
  const answers = new Set();
  for (let k = 0; k < values.length; k++) for (let i = k + 1; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[k] + values[i] + values[j] === 0) answers.add(key([values[k], values[i], values[j]]));
    }
  }
  return [...answers].sort();
}

let checked = 0;
// Exhaustive tiny inputs exercise negatives, equal endpoints, zeroes, no-answer
// and duplicate-output cases without a flaky random seed.
for (let size = 2; size <= 5; size++) {
  for (let encoded = 0; encoded < 4 ** size; encoded++) {
    const input = Array.from({ length: size }, (_, index) => Math.floor(encoded / 4 ** index) % 4 - 1);
    const untouched = [...input];
    const sorted = [...input].sort((a, b) => a - b);
    for (const target of [-2, 0, 2, 5]) {
      const trace = twoSumFilm(sorted, target);
      const end = trace.frames.at(-1).pointers;
      assert.equal(end.found, pairs(sorted).some(([, , sum]) => sum === target));
      if (end.found) {
        assert.ok(end.i < end.j);
        assert.equal(sorted[end.i] + sorted[end.j], target);
      }
      for (const frame of trace.frames.filter((frame) => frame.pointers.phase === 'check')) {
        const { i, j } = frame.pointers;
        const sum = sorted[i] + sorted[j];
        if (sum < target) assert.ok(sorted.slice(i + 1, j + 1).every((value) => sorted[i] + value < target));
        if (sum > target) assert.ok(sorted.slice(i, j).every((value) => sorted[j] + value > target));
      }
      checked++;
    }
    const heights = input.map((value) => value + 1);
    const water = containerFilm(heights);
    const expectedArea = Math.max(0, ...pairs(heights).map(([i, j]) => (j - i) * Math.min(heights[i], heights[j])));
    assert.equal(water.frames.at(-1).pointers.best, expectedArea);
    const [bestI, bestJ] = water.frames.at(-1).pointers.bestPair;
    assert.ok(bestI < bestJ, 'Keep a real pair even when all areas are zero');
    assert.equal((bestJ - bestI) * Math.min(heights[bestI], heights[bestJ]), expectedArea);
    assert.equal(water.frames.filter((frame) => frame.pointers.phase === 'check').length, size - 1);
    const triples = threeSumFilm(input);
    const answers = triples.frames.at(-1).pointers.results;
    assert.equal(new Set(answers.map(key)).size, answers.length, 'No duplicate triplets');
    assert.deepEqual(answers.map(key).sort(), bruteTriples(input));
    for (const frame of triples.frames.filter((frame) => frame.pointers.phase === 'check')) {
      const { k, i, j } = frame.pointers;
      assert.ok(k < i && i < j, 'Three distinct positions');
    }
    assert.deepEqual(input, untouched, 'Story builders preserve caller input');
    assert.deepEqual(triples.frames[0].pointers.results, [], 'Previous frames do not inherit later answers');
    checked += 2;
  }
}
assert.throws(() => twoSumFilm([3, 1], 4), /sorted/);
for (const problem of problems) {
  for (const view of ['understand', 'play', 'practice']) assert.equal(parseProblemRoute(problemHref(problem.id, view)).view, view);
  for (const choice of examples[problem.id]) {
    const film = choice.film;
    assert.equal(sceneAt(film, 0).index, 0);
    assert.equal(sceneAt(film, film.duration).index, film.frames.length - 1);
    assert.equal(film.duration, film.frames.reduce((sum, frame) => sum + frame.duration, 0));
    assert.ok(film.frames.every((frame) => frame.caption && frame.duration >= 3.2));
  }
}
assert.equal(parseProblemRoute('#/problems/two-pointers/connections').directoryView, 'connections');
assert.equal(parseProblemRoute('#/problems/two-pointers/missing'), null);
console.log(`Problems: ${checked} exhaustive comparisons with brute-force answers; safe discards, distinct indices, duplicate handling, immutable states, and routes passed.`);
