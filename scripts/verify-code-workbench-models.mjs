import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { bubbleTrace, shellCodeTrace } from '../src/algorithms/code-traces/adjacent.ts';
import { mergeCodeTrace, timCodeTrace } from '../src/algorithms/code-traces/merge.ts';
import { linkedTrace } from '../src/structures/code-traces.ts';
import { countTrace, recurrenceTrace, spaceTrace } from '../src/complexity/code-traces.ts';
import { inductionTrace, telescopeTrace } from '../src/discrete/code-traces.ts';
import { windowTrace, temperatureTrace, prefixTrace, binaryTrace } from '../src/problems/code-traces.ts';
import { comparisonTrace } from '../src/complexity/comparison-trace.ts';
import { oddSumTrace } from '../src/discrete/odd-sum.ts';
import { arrayTrace } from '../src/structures/array-trace.ts';
import { levelSumTrace, bitsTrace } from '../src/problems/tree-traces.ts';
import { parseValues } from '../src/shared/trace/model.ts';
let checks = 0;
const validate = (trace) => {
  assert.ok(trace.scenes.length);
  for (const scene of trace.scenes) {
    assert.ok(scene.title && scene.why);
    for (const line of scene.lines)
      assert.ok(
        Number.isInteger(line) && line >= 0 && line < trace.code.length,
        `${trace.title}: invalid line ${line}`,
      );
    for (const row of scene.rows)
      for (const index of [...(row.active ?? []), ...(row.settled ?? []), ...(row.group ?? [])])
        assert.ok(index >= 0 && index < row.values.length);
  }
  return trace;
};
const last = (t) => validate(t).scenes.at(-1);
const decode = (values) => values.map((v) => (typeof v === 'number' ? v : Number(v.split(' · ')[0])));
const cases = [[], [99], [-20, 99], [3, 3, 1, 3], Array.from({ length: 8 }, (_, i) => 8 - i)];
for (let n = 0; n <= 5; n++)
  for (let encoded = 0; encoded < 3 ** n; encoded++)
    cases.push(Array.from({ length: n }, (_, i) => (Math.floor(encoded / 3 ** i) % 3) - 1));
for (const values of cases) {
  const sorted = [...values].sort((a, b) => a - b);
  for (const trace of [
    bubbleTrace(values),
    shellCodeTrace(values),
    shellCodeTrace(values, 'knuth'),
    mergeCodeTrace(values),
    timCodeTrace(values),
  ]) {
    assert.deepEqual(decode(last(trace).rows[0].values), sorted);
    checks++;
    if (trace.title.startsWith('Merge') || trace.title.startsWith('TimSort')) {
      const items = last(trace).rows[0].values.map((v) => v.split(' · #').map(Number));
      for (let i = 1; i < items.length; i++)
        if (items[i][0] === items[i - 1][0]) assert.ok(items[i][1] > items[i - 1][1], 'stable identity');
    }
  }
  const inserted = [...values];
  inserted.splice(Math.floor(values.length / 2), 0, 42);
  assert.deepEqual(last(arrayTrace(values)).rows[0].values, inserted);
  const levels = last(levelSumTrace(values)).rows.at(-1).values;
  const expectedLevels = [];
  for (let d = 0; 2 ** d - 1 < values.length; d++)
    expectedLevels.push(values.slice(2 ** d - 1, 2 ** (d + 1) - 1).reduce((s, v) => s + v, 0));
  assert.deepEqual(levels, expectedLevels);
  const inversions = values.reduce((s, v, i) => s + values.slice(i + 1).filter((x) => v > x).length, 0);
  assert.equal(last(bubbleTrace(values)).variables.swaps, inversions);
  const stack = last(temperatureTrace(values)).rows[2].values;
  const expected = values.map((v, i) => {
    const j = values.findIndex((x, k) => k > i && x > v);
    return j < 0 ? 0 : j - i;
  });
  assert.deepEqual(stack, expected);
  let count = 0;
  for (let i = 0; i < values.length; i++)
    for (let j = i + 1; j <= values.length; j++) if (values.slice(i, j).reduce((s, v) => s + v, 0) === 5) count++;
  assert.equal(last(prefixTrace(values)).variables.answer, count);
  const k = Math.min(3, values.length);
  if (k)
    assert.equal(
      last(windowTrace(values)).variables.best,
      Math.max(
        ...values.slice(0, values.length - k + 1).map((_, i) => values.slice(i, i + k).reduce((s, v) => s + v, 0)),
      ),
    );
  else validate(windowTrace(values));
  const search = last(binaryTrace(values));
  const sortedSearch = [...values].sort((a, b) => a - b);
  assert.equal(search.variables.result >= 0, values.includes(5));
  if (search.variables.result >= 0) assert.equal(sortedSearch[search.variables.result], 5);
}
for (let n = 0; n <= 8; n++)
  for (const doubly of [false, true])
    for (const variant of ['insert', 'prepend', 'append', 'remove', 'reverse', 'traverse']) {
      const values = Array.from({ length: n }, (_, i) => i % 3);
      const result = last(linkedTrace(values, variant, doubly));
      const nodes = new Map(result.nodes.map((node) => [node.id, node]));
      const next = (id) => result.links.find((l) => l.from === id && l.label === 'next')?.to ?? 'None';
      const prev = (id) => result.links.find((l) => l.from === id && l.label === 'prev')?.to ?? 'None';
      let id = result.variables.head,
        previous = 'None';
      const seen = new Set(),
        data = [];
      while (id !== 'None') {
        assert.ok(nodes.has(id), 'reachable node exists');
        assert.ok(!seen.has(id), 'no cycle');
        seen.add(id);
        data.push(nodes.get(id).value);
        if (doubly) assert.equal(prev(id), previous, 'prev agrees with forward chain');
        previous = id;
        id = next(id);
      }
      assert.equal(result.variables.tail, previous);
      assert.equal(seen.size, result.nodes.length, 'all nodes reachable');
      let expected = [...values];
      if (variant === 'reverse') expected.reverse();
      if (['insert', 'prepend', 'append'].includes(variant))
        expected.splice(variant === 'prepend' ? 0 : variant === 'append' ? n : Math.floor(n / 2), 0, 42);
      if (variant === 'remove' && n) expected.splice(Math.floor(n / 2), 1);
      assert.deepEqual(data, expected);
      checks++;
    }
for (let n = 1; n <= 8; n++) {
  for (const variant of ['linear', 'triangular', 'halving'])
    assert.equal(
      last(countTrace(n, variant)).variables.work,
      variant === 'linear' ? n : variant === 'triangular' ? (n * (n - 1)) / 2 : Math.floor(Math.log2(n)),
    );
  for (const variant of ['two-half', 'one-half', 'three-half', 'subtract']) {
    const a = variant === 'three-half' ? 3 : variant === 'two-half' ? 2 : 1;
    const solve = (n) => (n <= 1 ? 1 : n + a * solve(variant === 'subtract' ? n - 1 : Math.floor(n / 2)));
    assert.equal(last(recurrenceTrace(n, variant)).variables['exact model total'], solve(n));
  }
  assert.deepEqual(
    last(bitsTrace(n)).rows[0].values,
    Array.from(
      { length: n + 1 },
      (_, i) =>
        i
          .toString(2)
          .split('')
          .filter((c) => c === '1').length,
    ),
  );
  const square = last(oddSumTrace(n));
  assert.equal(square.grid.length, (n + 1) ** 2);
  assert.equal(square.grid.filter((c) => c.role === 'active').length, 2 * n + 1);
  assert.equal(square.variables['old sum'], n * n);
  assert.equal(last(spaceTrace(n)).variables['live frames'], 0);
  assert.equal(last(spaceTrace(n)).variables['peak frames'], n + 1);
  validate(inductionTrace(n));
  validate(telescopeTrace(n));
  checks++;
}
for (const values of [
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1],
]) {
  const trace = comparisonTrace(values);
  assert.equal(last(trace).variables['candidate orders'], 1);
  for (let i = 1; i < trace.scenes.length; i++)
    assert.ok(trace.scenes[i].variables['candidate orders'] <= trace.scenes[i - 1].variables['candidate orders']);
}
assert.throws(() => comparisonTrace([1, 1, 2]));
assert.throws(() => parseValues('1, NaN'));
assert.throws(() => parseValues('100'));
assert.throws(() => parseValues('1,2,3,4,5,6,7,8,9'));
assert.deepEqual(parseValues('[]'), []);
// Run displayed Python, including TimSort helpers and both linked representations.
const sourceTests = [];
for (const values of [[], [5], [8, 3, 6, 3, 5], [-2, 0, -2, 9], [9, 8, 7, 6, 5, 4, 3, 2]])
  for (const [fn, trace, args] of [
    ['bubble_sort', bubbleTrace(values), [values]],
    ['shell_sort', shellCodeTrace(values), [values, values.length > 1 ? [Math.floor(values.length / 2), 1] : [1]]],
    ['teaching_timsort', timCodeTrace(values), [values]],
    ['merge_sort', mergeCodeTrace(values), [values, 0, values.length]],
  ])
    sourceTests.push({ fn, code: trace.code.join('\n'), args, expected: [...values].sort((a, b) => a - b) });
for (let n = 1; n <= 8; n++) {
  for (const variant of ['linear', 'triangular', 'halving']) {
    const trace = countTrace(n, variant);
    sourceTests.push({
      fn: 'count_work',
      code: trace.code.join('\n'),
      args: [n],
      expected: last(trace).variables.work,
    });
  }
  for (const variant of ['two-half', 'one-half', 'three-half', 'subtract']) {
    const trace = recurrenceTrace(n, variant);
    sourceTests.push({
      fn: 'measured_work',
      code: trace.code.join('\n'),
      args: [n],
      expected: last(trace).variables['exact model total'],
    });
  }
  const trace = bitsTrace(n);
  sourceTests.push({
    fn: 'counting_bits',
    code: trace.code.join('\n'),
    args: [n],
    expected: last(trace).rows[0].values,
  });
}
for (const values of [[], [-2, 4, 3, 1, 5], [3, 3, 1, 7, 5, 9, 2, 8]])
  for (const [fn, trace, args, expected] of [
    [
      'insert_at',
      arrayTrace(values),
      [values, Math.floor(values.length / 2), 42],
      last(arrayTrace(values)).rows[0].values,
    ],
    ['days_until_warmer', temperatureTrace(values), [values], last(temperatureTrace(values)).rows[2].values],
    ['count_subarrays', prefixTrace(values), [values, 5], last(prefixTrace(values)).variables.answer],
    ['level_sums', levelSumTrace(values), [values], last(levelSumTrace(values)).rows.at(-1).values],
  ])
    sourceTests.push({ fn, code: trace.code.join('\n'), args, expected });
const program = `import json,sys\nfor case in json.load(sys.stdin):\n ns={}\n exec(case['code'],ns)\n args=case['args']\n result=ns[case['fn']](*args)\n if case['fn']=='merge_sort': result=args[0]\n assert result==case['expected'], (case['fn'],result,case['expected'])\nprint('Displayed Python: sorting, TimSort helpers, complexity counters, array insertion, BFS, DP, stacks and prefix sums execute correctly.')\n`;
const python = spawnSync(process.env.PYTHON ?? 'python', ['-c', program], {
  input: JSON.stringify(sourceTests),
  encoding: 'utf8',
});
assert.equal(python.status, 0, python.stderr);
console.log(python.stdout.trim());
console.log(
  `Code workbench models: ${checks} sorting, stability, pointer-invariant and cost cases passed; Problems checked against brute force.`,
);
