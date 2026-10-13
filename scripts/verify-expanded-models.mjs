import assert from 'node:assert/strict';
import { catalogLessons, patterns, catalogHref, topicKey, parseCatalogRoute } from '../src/problems/catalog/model.ts';
import { shellTrace, quickTrace, predictionOptions } from '../src/algorithms/components/trace-practice/model.ts';
import { insertionState } from '../src/structures/components/insertion/model.ts';
import { themes } from '../src/app/components/appearance/model.ts';
assert.equal(themes.length, 15);
assert.equal(new Set(themes.map((t) => t.id)).size, 15);
assert.equal(patterns.length, 16);
assert.equal(new Set(catalogLessons.map(topicKey)).size, catalogLessons.length);
for (const entry of catalogLessons) {
  assert.ok(entry.trace.length >= 3 && entry.trace.every((s) => s.state && s.why), entry.title);
  assert.equal(entry.options.length, 3);
  assert.equal(new Set(entry.options).size, 3);
  assert.ok(entry.explanation && entry.invariant && entry.time && entry.space && entry.trap);
  for (const view of ['understand', 'play', 'practice'])
    assert.equal(parseCatalogRoute(catalogHref(entry, view)).topic, topicKey(entry));
}
for (const mode of ['prepend', 'middle', 'append']) {
  for (let step = 0; step < 3; step++) {
    const state = insertionState(step, mode);
    const next = new Map(state.links);
    const visited = [];
    let current = state.head;
    while (current) {
      assert.ok(!visited.includes(current), 'No cycles');
      visited.push(current);
      current = next.get(current);
    }
    assert.deepEqual(visited, state.order);
    if (step === 2) assert.equal(visited.at(-1), state.tail);
  }
}
let checked = 0;
for (let size = 3; size <= 6; size++) {
  for (let encoded = 0; encoded < 3 ** size; encoded++) {
    const input = Array.from({ length: size }, (_, i) => Math.floor(encoded / 3 ** i) % 3);
    const sorted = [...input].sort((a, b) => a - b);
    const shell = shellTrace(input, [3, 1]);
    assert.deepEqual(shell.at(-1).values, sorted);
    for (const state of shell.filter((s) => s.title.endsWith('pass complete'))) {
      for (let i = state.gap; i < size; i++) assert.ok(state.values[i - state.gap] <= state.values[i]);
    }
    const quick = quickTrace(input),
      end = quick.at(-1),
      pivot = end.held,
      position = end.group[0];
    assert.deepEqual(
      [...end.values].sort((a, b) => a - b),
      sorted,
    );
    assert.ok(end.values.slice(0, position).every((v) => v <= pivot));
    assert.ok(end.values.slice(position + 1).every((v) => v >= pivot));
    input.forEach((value, i) => assert.equal(value, Math.floor(encoded / 3 ** i) % 3));
    checked++;
  }
}
const demo = shellTrace([11, 4, 9, 2, 8, 6, 3]);
for (let i = 0; i < demo.length - 1; i++) assert.equal(predictionOptions(demo[i], demo[i + 1]).length, 3);
console.log(
  `${catalogLessons.length} new lessons across 16 patterns; ${checked} exhaustive sorting cases, node reachability, routes, and 15 themes passed.`,
);
