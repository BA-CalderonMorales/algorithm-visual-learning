import { levelSumTrace, bitsTrace } from './tree-traces.ts';
import { recorder } from '../shared/trace/model.ts';
import { linkedTrace } from '../structures/code-traces.ts';
export function windowTrace(a: number[]) {
  const k = Math.min(3, a.length),
    trace = recorder(
      [
        'def max_window(a, k):',
        '    if not 1 <= k <= len(a): raise ValueError(k)',
        '    total = sum(a[:k]); best = total',
        '    for right in range(k, len(a)):',
        '        total -= a[right - k]',
        '        total += a[right]',
        '        best = max(best, total)',
        '    return best',
      ],
      'Sliding window: subtract, add, compare.',
      'k is min(3, input length) in this playground. Empty input is rejected. O(n) time and O(1) auxiliary space; the diagram is a visualization, not an extra buffer in the algorithm.',
    );
  if (!k) {
    trace.add({
      title: 'Reject an empty window',
      why: 'A nonempty size-k window is required; the guard raises ValueError.',
      lines: [1],
      rows: [{ label: 'Input', values: a }],
      variables: { k },
    });
    return trace.finish();
  }
  let total = a.slice(0, k).reduce((s, v) => s + v, 0),
    best = total;
  const add = (title, why, lines, left, right, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        {
          label: 'Input — active positions are the window',
          values: a,
          active: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        },
      ],
      variables: { k, left, right, total, best, ...extra },
    });
  add(
    'Build the first full window',
    'Initialize best from a valid sum so negative inputs remain correct.',
    [2],
    0,
    k - 1,
  );
  for (let right = k; right < a.length; right++) {
    total -= a[right - k];
    add(
      'Remove the outgoing value',
      'The intermediate sum describes k−1 values; do not compare it with best yet.',
      [4],
      right - k + 1,
      right - 1,
      { outgoing: a[right - k] },
    );
    total += a[right];
    add(
      'Add the incoming value',
      'The window again contains exactly k consecutive values.',
      [5],
      right - k + 1,
      right,
      { incoming: a[right] },
    );
    best = Math.max(best, total);
    add('Compare this full window', 'Only complete windows can improve the answer.', [6], right - k + 1, right);
  }
  add(
    'Return the greatest full-window sum',
    'The scan evaluated every valid start once.',
    [7],
    a.length - k,
    a.length - 1,
  );
  return trace.finish();
}
export function temperatureTrace(a: number[]) {
  const code = [
    'def days_until_warmer(a):',
    '    answer = [0] * len(a); stack = []',
    '    for i, temperature in enumerate(a):',
    '        while stack and a[stack[-1]] < temperature:',
    '            earlier = stack.pop()',
    '            answer[earlier] = i - earlier',
    '        stack.append(i)',
    '    return answer',
  ];
  const trace = recorder(
    code,
    'Monotonic stack: unresolved days wait.',
    'Stack entries are indices, not temperatures. Each index is pushed once and popped at most once: O(n) total time, O(n) auxiliary space. Equal temperatures are not warmer.',
  );
  const answer = a.map(() => 0),
    stack = [];
  const add = (title, why, lines, i = -1, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Temperatures', values: a, active: i < 0 ? [] : [i] },
        { label: 'Pending indices — top on the right', values: stack },
        { label: 'Days to wait — zero means unresolved or no warmer day', values: answer },
      ],
      variables: { i, ...extra },
    });
  add('Initialize pending days', 'Zero is the final answer only if no future day resolves it.', [1]);
  for (let i = 0; i < a.length; i++) {
    add('Read the next temperature', 'Resolve older colder days before pushing the current day.', [2, 3], i, {
      temperature: a[i],
    });
    while (stack.length && a[stack.at(-1)] < a[i]) {
      const earlier = stack.pop();
      add('Pop a colder pending day', 'This warmer day is the first qualifying one for that index.', [4], i, {
        earlier,
      });
      answer[earlier] = i - earlier;
      add('Store the index distance', 'Distance counts intervening days, not the difference in temperatures.', [5], i, {
        earlier,
        distance: i - earlier,
      });
    }
    stack.push(i);
    add('Push the current index', 'The unresolved temperatures are nonincreasing from bottom to top.', [6], i);
  }
  add('Return the answer', 'Any index left on the stack has no warmer day later.', [7]);
  return trace.finish();
}
export function binaryTrace(values: number[]) {
  const a = [...values].sort((x, y) => x - y),
    target = 5;
  const trace = recorder(
    [
      'def binary_search(a, target):',
      '    lo, hi = 0, len(a)',
      '    while lo < hi:',
      '        mid = (lo + hi) // 2',
      '        if a[mid] == target: return mid',
      '        if a[mid] < target: lo = mid + 1',
      '        else: hi = mid',
      '    return -1',
    ],
    'Binary search: shrink a half-open range.',
    'This fundamentals exercise sorts the supplied input first and searches for 5. Search alone costs O(log n); sorting this playground input is separate. It teaches the range invariant used by more advanced search problems.',
  );
  let lo = 0,
    hi = a.length,
    mid = -1;
  const add = (title, why, lines, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        {
          label: 'Sorted input — purple is the candidate range',
          values: a,
          group: a.map((_, i) => i).filter((i) => i >= lo && i < hi),
          active: mid >= 0 ? [mid] : [],
        },
      ],
      variables: { target, lo, hi, mid, ...extra },
    });
  add('Search starts over the whole array', 'If 5 exists, a matching index is inside [lo, hi).', [1]);
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    add(
      'Inspect the middle candidate',
      'Compare a[mid] with target; do not discard mid before checking equality.',
      [3],
      { value: a[mid] },
    );
    if (a[mid] === target) {
      add('Return a matching index', 'A match is found. This version does not promise the first duplicate.', [4], {
        result: mid,
      });
      return trace.finish();
    }
    if (a[mid] < target) {
      lo = mid + 1;
      add('Discard the lower half including mid', 'All discarded values are below the target.', [5]);
    } else {
      hi = mid;
      add('Discard the upper half starting at mid', 'All discarded values are above the target.', [6]);
    }
  }
  add('No candidates remain', 'The empty interval proves the target is absent.', [7], { result: -1 });
  return trace.finish();
}
export function prefixTrace(a: number[]) {
  const target = 5,
    trace = recorder(
      [
        'def count_subarrays(a, target):',
        '    seen = {0: 1}; prefix = answer = 0',
        '    for value in a:',
        '        prefix += value',
        '        answer += seen.get(prefix - target, 0)',
        '        seen[prefix] = seen.get(prefix, 0) + 1',
        '    return answer',
      ],
      'Prefix sums: count earlier matching boundaries.',
      'The empty prefix has frequency one. Query before recording the current prefix so empty subarrays are not counted. Negative numbers are supported. O(n) expected time with a hash map, O(n) space.',
    );
  const seen = new Map([[0, 1]]);
  let prefix = 0,
    answer = 0;
  const add = (title, why, lines, i = -1, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Input', values: a, active: i < 0 ? [] : [i] },
        { label: 'Seen prefix → frequency', values: Array.from(seen, ([sum, count]) => `${sum} → ${count}`) },
      ],
      variables: { target, prefix, answer, ...extra },
    });
  add('Record the empty prefix', 'This allows a qualifying subarray to start at index zero.', [1]);
  for (let i = 0; i < a.length; i++) {
    prefix += a[i];
    add('Extend the prefix', 'prefix is the sum through this index.', [3], i);
    const matches = seen.get(prefix - target) ?? 0;
    answer += matches;
    add(
      'Count matching earlier boundaries',
      'Every earlier prefix equal to prefix−target defines one subarray ending here.',
      [4],
      i,
      { needed: prefix - target, matches },
    );
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
    add('Record the current boundary', 'Repeated prefix sums require frequencies, not a set.', [5], i);
  }
  add('Return the count', 'The answer counts all nonempty subarrays with sum 5.', [6]);
  return trace.finish();
}
const lab = (title, intro, build, input = '4, 1, 6, 2, 5') => ({ title, intro, build, input });
export const problemLabs = {
  'level-order-sum': lab(
    'Breadth-first search · a queue for each level',
    'Follow tree levels, the pending queue and the running sum together.',
    levelSumTrace,
  ),
  'counting-bits': {
    title: 'Dynamic programming · counting bits',
    intro: 'Trace how a larger state reuses the answer already stored for a smaller state.',
    size: true,
    input: '6',
    build: bitsTrace,
  },
  'fixed-length-sliding-window': lab(
    'Sliding window · keep the sum honest',
    'Change the values, including negatives. Follow outgoing and incoming values alongside the code.',
    windowTrace,
  ),
  'maximum-sum-of-subarrays-of-size-k': lab(
    'Maximum size-k sum · reuse work',
    'Watch each update before comparing a complete window with best.',
    windowTrace,
  ),
  'daily-temperatures': lab(
    'Daily temperatures · pending indices',
    'Watch a warmer day resolve multiple pending days. The stack stores positions so distances can be computed.',
    temperatureTrace,
    '7, 6, 6, 8, 5, 9',
  ),
  'subarray-sum-equals-k': lab(
    'Subarray sums · prefix boundaries',
    'The target is 5. Track prefix frequencies and the matching earlier boundaries.',
    prefixTrace,
    '2, 3, -2, 2, 5',
  ),
  'binary-search-overview': lab(
    'Binary search · range fundamentals',
    'Begin with an ordinary sorted search before moving to rotated arrays or searching an answer range.',
    binaryTrace,
  ),
};
export const linkedFundamentals = lab(
  'Linked-list implementation lab',
  'Practice reference updates before using them inside multi-step linked-list problems.',
  (a, variant) => linkedTrace(a, variant.split(':')[0], variant.endsWith('double')),
);
linkedFundamentals.variants = ['traverse', 'insert', 'remove', 'reverse'].flatMap((operation) =>
  ['single', 'double'].map((kind) => ({
    id: `${operation}:${kind}`,
    label: `${kind === 'double' ? 'Doubly' : 'Singly'} · ${operation}`,
  })),
);
