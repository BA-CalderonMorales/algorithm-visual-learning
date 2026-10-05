import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { spawnSync } from 'node:child_process';
import { algorithms } from '../src/algorithms/model.ts';
import { implementations, approaches, implementationHref } from '../src/problems/two-pointers/implementations/model.ts';
import { languages } from '../src/shared/ui/code-view/languages.ts';
import { parseProblemRoute } from '../src/problems/model.ts';
import { highlightCode } from '../src/shared/ui/code-view/model.ts';

const triples = (values) => {
  const result = new Set();
  for (let a = 0; a < values.length; a++) for (let i = a + 1; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) if (values[a] + values[i] + values[j] === 0) {
      result.add([values[a], values[i], values[j]].sort((x, y) => x - y).join(','));
    }
  }
  return [...result].sort();
};
const normalize = (value) => JSON.parse(JSON.stringify(value));
const callable = (source, name, typed) => runInNewContext(
  (typed ? stripTypeScriptTypes(source) : source) + '\n' + name,
  { console: { log() {} } },
);
const inputs = [[], [-4], [0, 0, 0, 0, 0], [-4, -1, -1, 0, 1, 2], [1, 8, 6, 2, 5, 4, 8, 3, 7]];
for (let size = 0; size <= 5; size++) for (let encoded = 0; encoded < 4 ** size; encoded++) {
  inputs.push(Array.from({ length: size }, (_, i) => Math.floor(encoded / 4 ** i) % 4 - 1));
}
let checked = 0;
for (const [id, definition] of Object.entries(implementations)) {
  for (const approach of approaches) for (const language of languages) {
    const href = implementationHref(id, approach.id, language.id);
    const route = parseProblemRoute(href);
    assert.equal(route.topic, id);
    assert.equal(route.view, 'implementations');
    assert.equal(route.approach, approach.id);
    assert.equal(route.language, language.id);
    const source = await readFile(new URL(`../src/problems/two-pointers/${id}/implementations/${approach.id}/${language.file}`, import.meta.url), 'utf8');
    assert.equal(highlightCode(source, language.id).map(line => line.map(token => token.text).join('')).join('\n'), source);
    if (language.id.startsWith('python')) continue;
    const fn = callable(source, definition.functionName, language.id === 'typescript');
    for (const values of inputs) {
      const input = id === 'two-sum' ? [...values].sort((a, b) => a - b) : id === 'container' ? values.map(x => Math.max(0, x)) : [...values];
      const original = [...input];
      if (id === 'two-sum') {
        for (const target of [-2, 0, 2, 5]) {
          const answer = normalize(fn(input, target));
          const exists = input.some((value, i) => input.slice(i + 1).some(partner => value + partner === target));
          assert.equal(answer !== null, exists, href);
          if (answer) {
            const [i, j] = answer;
            assert.ok(Number.isInteger(i) && Number.isInteger(j) && i >= 0 && i < j && j < input.length);
            assert.equal(input[i] + input[j], target);
          }
          checked++;
        }
      } else if (id === 'container') {
        let expected = 0;
        for (let i = 0; i < input.length; i++) for (let j = i + 1; j < input.length; j++) {
          expected = Math.max(expected, (j - i) * Math.min(input[i], input[j]));
        }
        assert.equal(fn(input), expected, href);
        checked++;
      } else {
        const result = normalize(fn(input));
        const keys = result.map(triplet => triplet.join(','));
        assert.equal(new Set(keys).size, result.length);
        assert.deepEqual(keys.sort(), triples(input), href);
        checked++;
      }
      assert.deepEqual(input, original, 'Problem solutions must preserve input');
    }
  }
}
for (const algorithm of algorithms) for (const language of languages.filter(x => !x.id.startsWith('python'))) {
  const source = await readFile(new URL(`../src/algorithms/${algorithm.id}/implementations/${language.file}`, import.meta.url), 'utf8');
  const fn = callable(source, algorithm.id + 'Sort', language.id === 'typescript');
  for (const values of inputs) {
    const input = [...values];
    assert.deepEqual(normalize(fn(input)), [...values].sort((a, b) => a - b), `${algorithm.id}/${language.id}`);
    assert.deepEqual(input, values, 'JS/TS sorting examples return copies');
    checked++;
  }
}
for (const tail of ['best/rust', 'missing/python/simple', 'brute/python/nope']) {
  assert.equal(parseProblemRoute('#/problems/two-pointers/two-sum/implementations/' + tail), null);
}
assert.equal(parseProblemRoute('#/problems/two-pointers/two-sum/practice/best'), null);
console.log(`Implementations: ${checked} JS/TS correctness checks, all source/routes, highlight round trips and input preservation passed.`);

// Use an explicitly supplied Python if needed; no machine paths enter source.
const candidates = process.env.PYTHON ? [process.env.PYTHON] : process.platform === 'win32' ? ['python', 'python3', 'py'] : ['python3', 'python'];
let result;
for (const executable of candidates) {
  result = spawnSync(executable, ['scripts/verify-implementation-examples.py'], { encoding: 'utf8' });
  if (!result.error) break;
}
if (result.error) throw new Error('Python is required to verify the Python examples. Set PYTHON to its executable path.');
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
assert.equal(result.status, 0, 'Python implementation examples failed');
