import { recorder } from '../shared/trace/model.ts';
export function levelSumTrace(a: number[]) {
  const trace = recorder(
    [
      'from collections import deque',
      'def level_sums(a):',
      '    if not a: return []',
      '    queue = deque([0]); sums = []',
      '    while queue:',
      '        total = 0',
      '        for _ in range(len(queue)):',
      '            i = queue.popleft()',
      '            total += a[i]',
      '            left, right = 2*i + 1, 2*i + 2',
      '            if left < len(a): queue.append(left)',
      '            if right < len(a): queue.append(right)',
      '        sums.append(total)',
      '    return sums',
    ],
    'Breadth-first search: finish one level at a time.',
    'Input values represent a complete binary tree in level order. Children of index i are 2i+1 and 2i+2 when present. Snapshot the queue length before processing a level. O(n) time and O(width) queue space, plus returned output.',
  );
  const queue = a.length ? [0] : [],
    sums = [];
  let total = 0,
    depth = 0;
  const levels = () =>
    Array.from({ length: Math.ceil(Math.log2(a.length + 1)) }, (_, d) => ({
      label: `Tree depth ${d} — value · original index`,
      values: a.slice(2 ** d - 1, 2 ** (d + 1) - 1).map((v, k) => `${v} · #${2 ** d - 1 + k}`),
    }));
  const add = (title, why, lines, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        ...levels(),
        { label: 'Queue of indices — next to remove on the left', values: queue },
        { label: 'Completed level sums', values: sums },
      ],
      variables: { depth, total, ...extra },
    });
  if (!a.length) {
    add('Return an empty result', 'An empty tree has no levels.', [2]);
    return trace.finish();
  }
  add('Queue the root', 'Only root index zero is waiting.', [3]);
  while (queue.length) {
    total = 0;
    const levelSize = queue.length;
    add(
      'Freeze the current level size',
      'New children go to the next level; they must not be included in this level’s loop count.',
      [5, 6],
      { levelSize },
    );
    for (let processed = 0; processed < levelSize; processed++) {
      const i = queue.shift();
      add(
        'Remove the next pending index',
        'FIFO order keeps every current-level node ahead of all its children.',
        [7],
        { i, processed, levelSize },
      );
      total += a[i];
      add('Accumulate this level’s sum', 'Use the node value, not its index.', [8], { i, processed, levelSize });
      const left = 2 * i + 1,
        right = 2 * i + 2;
      if (left < a.length) {
        queue.push(left);
        add('Queue the left child', 'This child waits for the next outer-loop level.', [10], { i, left, levelSize });
      }
      if (right < a.length) {
        queue.push(right);
        add('Queue the right child', 'Preserve left-to-right order within the next level.', [11], {
          i,
          right,
          levelSize,
        });
      }
    }
    sums.push(total);
    add(
      'Store the completed level sum',
      'Exactly the frozen number of nodes contributed. The remaining queue belongs to the next level.',
      [12],
      { levelSize },
    );
    depth++;
  }
  add('Return all level sums', 'Each node entered and left the queue exactly once.', [13]);
  return trace.finish();
}
export function bitsTrace(n: number) {
  const bits = Array.from({ length: n + 1 }, () => 0);
  const trace = recorder(
    [
      'def counting_bits(n):',
      '    bits = [0] * (n + 1)',
      '    for x in range(1, n + 1):',
      '        bits[x] = bits[x >> 1] + (x & 1)',
      '    return bits',
    ],
    'Dynamic programming: use a solved smaller state.',
    'bits[x] counts set bits in x. Right shift removes the last bit; x & 1 contributes that bit. States are evaluated in increasing order so bits[x>>1] is ready. O(n) time and O(n) returned storage in the word-RAM model.',
  );
  const add = (title, why, lines, x = 0) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        {
          label: 'bits table — index is the number',
          values: bits,
          active: [x],
          settled: bits.map((_, i) => i).filter((i) => i < x),
        },
      ],
      variables: { x, 'binary x': x.toString(2), 'smaller state': x >> 1, 'last bit': x & 1 },
    });
  add(
    'Initialize the base state',
    'Zero has no set bits; every later entry will be filled using a smaller state.',
    [1],
  );
  for (let x = 1; x <= n; x++) {
    add(
      'Choose a ready dependency',
      'x>>1 is strictly smaller than positive x, so its answer has already been computed.',
      [2],
      x,
    );
    bits[x] = bits[x >> 1] + (x & 1);
    add(
      'Combine the smaller answer with the last bit',
      'This is a recurrence over table entries, not a recursive function call.',
      [3],
      x,
    );
  }
  add('Return the completed table', 'Each positive state required one constant-time transition.', [4], n);
  return trace.finish();
}
