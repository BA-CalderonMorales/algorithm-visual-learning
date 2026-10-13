import { timCode } from './tim-code.ts';
import { recorder } from '../../shared/trace/model.ts';
const display = (items) => items.map((item) => `${item.value} · #${item.origin}`);
export function mergeCodeTrace(input: number[]) {
  const a = input.map((value, origin) => ({ value, origin }));
  const code = [
    'def merge_sort(a, lo, hi):',
    '    if hi - lo <= 1:',
    '        return',
    '    mid = (lo + hi) // 2',
    '    merge_sort(a, lo, mid)',
    '    merge_sort(a, mid, hi)',
    '    left, right = a[lo:mid], a[mid:hi]',
    '    i = j = 0',
    '    out = []',
    '    while i < len(left) and j < len(right):',
    '        if left[i] <= right[j]:',
    '            out.append(left[i]); i += 1',
    '        else:',
    '            out.append(right[j]); j += 1',
    '    out.extend(left[i:])',
    '    out.extend(right[j:])',
    '    a[lo:hi] = out',
  ];
  const trace = recorder(
    code,
    'Merge sort: calls descend; buffers return sorted.',
    'Ranges use an exclusive hi bound. # labels retain original identity so equal values can be traced. This version sorts the working copy in place.',
  );
  let comparisons = 0,
    writes = 0;
  const stack = [];
  const add = (title, why, lines, lo, hi, extraRows = [], extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Working array', values: display(a), group: a.map((_, i) => i).filter((i) => i >= lo && i < hi) },
        ...extraRows,
        { label: 'Active calls — newest on the right', values: stack.map((s) => `[${s[0]},${s[1]})`) },
      ],
      variables: { lo, hi, comparisons, writes, ...extra },
    });
  function sort(lo, hi) {
    stack.push([lo, hi]);
    add(
      `Enter range [${lo},${hi})`,
      'A recursive call owns this contiguous range. Other ranges stay unchanged.',
      [0, 1],
      lo,
      hi,
    );
    if (hi - lo <= 1) {
      add('Base case: return this range', 'Zero or one item is already sorted. No merge occurs.', [2], lo, hi);
      stack.pop();
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    add(
      `Split at index ${mid}`,
      'The halves are not sorted yet. Both recursive calls must finish before merging.',
      [3],
      lo,
      hi,
      [],
      { mid },
    );
    add('Call the left half', 'The parent pauses while its child completes.', [4], lo, mid, [], { mid });
    sort(lo, mid);
    add('Call the right half', 'The left half is ordered; now finish the right half.', [5], mid, hi, [], { mid });
    sort(mid, hi);
    const left = a.slice(lo, mid),
      right = a.slice(mid, hi),
      out = [];
    let i = 0,
      j = 0;
    const buffers = () => [
      {
        label: 'Left sorted buffer',
        values: display(left),
        active: i < left.length ? [i] : [],
        settled: left.map((_, k) => k).filter((k) => k < i),
      },
      {
        label: 'Right sorted buffer',
        values: display(right),
        active: j < right.length ? [j] : [],
        settled: right.map((_, k) => k).filter((k) => k < j),
      },
      { label: 'Merged output — grows one item at a time', values: display(out), settled: out.map((_, k) => k) },
    ];
    add(
      'Create the two sorted buffers',
      'These buffers preserve values while output is assembled. i and j mark the first unused item in each.',
      [6, 7, 8],
      lo,
      hi,
      buffers(),
      { mid, i, j },
    );
    while (i < left.length && j < right.length) {
      comparisons++;
      add(
        `Compare ${left[i].value} and ${right[j].value}`,
        'Only the two first unused values compete. Taking left on equality preserves stable identity order.',
        [9, 10],
        lo,
        hi,
        buffers(),
        { mid, i, j },
      );
      const chooseLeft = left[i].value <= right[j].value;
      out.push(chooseLeft ? left[i++] : right[j++]);
      writes++;
      add(
        `Copy ${out.at(-1).value} to output`,
        chooseLeft
          ? 'Advance i only. The right candidate remains available.'
          : 'Advance j only. The left candidate remains available.',
        [chooseLeft ? 11 : 13],
        lo,
        hi,
        buffers(),
        { mid, i, j },
      );
    }
    if (i < left.length) {
      writes += left.length - i;
      out.push(...left.slice(i));
      i = left.length;
      add(
        'Copy the unused left suffix',
        'The other buffer is exhausted. Remaining left values are already ordered.',
        [14],
        lo,
        hi,
        buffers(),
        { mid, i, j },
      );
    }
    if (j < right.length) {
      writes += right.length - j;
      out.push(...right.slice(j));
      j = right.length;
      add(
        'Copy the unused right suffix',
        'The other buffer is exhausted. Remaining right values are already ordered.',
        [15],
        lo,
        hi,
        buffers(),
        { mid, i, j },
      );
    }
    a.splice(lo, hi - lo, ...out);
    add(
      `Write sorted output back to [${lo},${hi})`,
      'This call has fulfilled its contract. Its parent can now use this range as a sorted buffer.',
      [16],
      lo,
      hi,
      buffers(),
      { mid, i, j },
    );
    stack.pop();
  }
  sort(0, a.length);
  add(
    'Every call has returned',
    'The whole array is ordered; equal values retain their original # order. Writes count buffer insertions, not every assignment.',
    [a.length <= 1 ? 2 : 16],
    0,
    a.length,
  );
  return trace.finish();
}
export function timCodeTrace(input: number[]) {
  const a = input.map((value, origin) => ({ value, origin }));
  const trace = recorder(
    timCode,
    'TimSort teaching model: discover, extend, merge.',
    'This executable teaching version uses natural runs, a small min_run of 3, and balanced pairwise merging. Production TimSort also has merge-stack policies and galloping; this is not its implementation.',
  );
  let start = 0,
    comparisons = 0;
  let runs = [];
  const add = (title, why, lines, active = [], extraRows = [], extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Array with original identity labels', values: display(a), active },
        ...runs.map(([lo, hi], i) => ({
          label: `Run ${i}: [${lo},${hi})`,
          values: display(a.slice(lo, hi)),
          settled: a.slice(lo, hi).map((_, k) => k),
        })),
        ...extraRows,
      ],
      variables: { start, runs: runs.length, comparisons, ...extra },
    });
  add('Begin with no known runs', 'A natural run is consecutive input already ascending or strictly descending.', [1]);
  while (start < a.length) {
    let end = start + 1;
    const descending = end < a.length && a[end].value < a[start].value;
    if (end < a.length) {
      comparisons++;
      end++;
      while (end < a.length) {
        comparisons++;
        if (descending ? a[end].value >= a[end - 1].value : a[end].value < a[end - 1].value) break;
        end++;
      }
    }
    add(
      `Found ${descending ? 'strictly descending' : 'ascending'} run [${start},${end})`,
      'Ascending allows ties. Descending must be strict, because reversing equal records would break stability.',
      [3, 4],
      a.map((_, i) => i).filter((i) => i >= start && i < end),
      [],
      { end, direction: descending ? 'descending' : 'ascending' },
    );
    if (descending) {
      const reversed = a.slice(start, end).reverse();
      a.splice(start, end - start, ...reversed);
      add(
        'Reverse the descending run',
        'The run becomes ascending without disturbing the order of equal values.',
        [5],
        a.map((_, i) => i).filter((i) => i >= start && i < end),
        [],
        { end },
      );
    }
    const naturalEnd = end;
    end = Math.max(end, Math.min(start + 3, a.length));
    add(
      `Extend to [${start},${end})`,
      'A short natural run is extended with insertion sort; long natural runs require no extension.',
      [6],
      [],
      [],
      { naturalEnd, end },
    );
    for (let i = naturalEnd; i < end; i++) {
      const key = a[i];
      let j = i;
      while (j > start) {
        comparisons++;
        if (a[j - 1].value <= key.value) break;
        a[j] = a[j - 1];
        j--;
      }
      a[j] = key;
      add(
        `Insert key ${key.value} at ${j}`,
        'Only this run’s range is insertion-sorted. Values outside it are untouched.',
        [30],
        [j],
        [],
        { i, j, key: key.value, end },
      );
    }
    runs.push([start, end]);
    start = end;
    add(
      'Remember the completed run',
      'Every recorded run is ascending. start advances to the first unprocessed position.',
      [8],
    );
  }
  while (runs.length > 1) {
    const next = [];
    for (let k = 0; k < runs.length; k += 2) {
      if (k + 1 === runs.length) {
        next.push(runs[k]);
        continue;
      }
      const [lo, mid] = runs[k],
        hi = runs[k + 1][1],
        left = a.slice(lo, mid),
        right = a.slice(mid, hi),
        out = [];
      let i = 0,
        j = 0;
      while (i < left.length && j < right.length) {
        comparisons++;
        const takeLeft = left[i].value <= right[j].value;
        out.push(takeLeft ? left[i++] : right[j++]);
        add(
          `Merge runs: take ${out.at(-1).value}`,
          takeLeft
            ? 'The left front is no greater, so take it and advance only i.'
            : 'The right front is smaller, so take it and advance only j.',
          [takeLeft ? 42 : 44],
          [],
          [
            { label: 'Left front buffer', values: display(left), active: i < left.length ? [i] : [] },
            { label: 'Right front buffer', values: display(right), active: j < right.length ? [j] : [] },
            { label: 'Output so far', values: display(out) },
          ],
          { i, j, lo, mid, hi },
        );
      }
      out.push(...left.slice(i), ...right.slice(j));
      a.splice(lo, hi - lo, ...out);
      next.push([lo, hi]);
      add(
        `Merged range [${lo},${hi})`,
        'Sorted neighboring runs become one sorted run. This round halves the run count.',
        [46],
        a.map((_, i) => i).filter((i) => i >= lo && i < hi),
      );
    }
    runs = next;
  }
  add(
    'Return the ordered array',
    'A single natural run would skip merging entirely. Scanning that already ordered input is linear.',
    [11],
    a.map((_, i) => i),
  );
  return trace.finish();
}
