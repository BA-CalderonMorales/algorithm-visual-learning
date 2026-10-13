import { recorder } from '../../shared/trace/model.ts';
export function bubbleTrace(input: number[]) {
  const a = [...input];
  const trace = recorder(
    [
      'def bubble_sort(values):',
      '    a = list(values)',
      '    for end in range(len(a) - 1, 0, -1):',
      '        changed = False',
      '        for j in range(end):',
      '            if a[j] > a[j + 1]:',
      '                a[j], a[j + 1] = a[j + 1], a[j]',
      '                changed = True',
      '        if not changed:',
      '            break',
      '    return a',
    ],
    'Bubble sort: neighbors settle the suffix.',
    'The early-exit version is stable and returns a copy. Counts here are exact element comparisons, not elapsed time.',
  );
  let comparisons = 0,
    swaps = 0;
  const row = (active = [], end = a.length - 1) => [
    { label: 'Array — indices remain fixed', values: a, active, settled: a.map((_, i) => i).filter((i) => i > end) },
  ];
  trace.add({
    title: 'Copy the input',
    why: 'The caller’s input is preserved. A pass moves the greatest remaining value to its right boundary.',
    lines: [1],
    rows: row(),
    variables: { comparisons, swaps },
  });
  for (let end = a.length - 1; end > 0; end--) {
    let changed = false;
    trace.add({
      title: `Start pass ending at ${end}`,
      why: 'The suffix beyond end is already in its final position.',
      lines: [2, 3],
      rows: row([], end),
      variables: { end, comparisons, swaps },
    });
    for (let j = 0; j < end; j++) {
      comparisons++;
      trace.add({
        title: `Compare indices ${j} and ${j + 1}`,
        why: `${a[j]} ${a[j] > a[j + 1] ? '>' : '≤'} ${a[j + 1]}. Equal values are never exchanged.`,
        lines: [5],
        rows: row([j, j + 1], end),
        variables: { end, j, comparisons, swaps },
        question: {
          prompt: `Do these neighbors need a swap?`,
          choices: [
            a[j] > a[j + 1] ? 'Yes, left is greater' : 'No, they are already ordered',
            a[j] > a[j + 1] ? 'No, keep them' : 'Yes, swap them',
            'Stop the whole algorithm',
          ],
          explanation: 'Only a strictly greater left value triggers the swap.',
        },
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        changed = true;
        swaps++;
        trace.add({
          title: 'Exchange the two neighbors',
          why: 'One adjacent inversion disappears. The larger value continues toward the right.',
          lines: [6, 7],
          rows: row([j, j + 1], end),
          variables: { end, j, comparisons, swaps },
        });
      }
    }
    trace.add({
      title: `Pass complete: index ${end} is fixed`,
      why: changed
        ? 'The greatest remaining value has reached end. Continue with a shorter prefix.'
        : 'No swap occurred. Every neighboring pair was ordered, so an early exit is safe.',
      lines: changed ? [2] : [8, 9],
      rows: row([], end - 1),
      variables: { end, changed: String(changed), comparisons, swaps },
    });
    if (!changed) break;
  }
  trace.add({
    title: 'Return the sorted copy',
    why: 'A sorted suffix grows after every pass; the early exit handles already ordered input.',
    lines: [10],
    rows: row([], -1),
    variables: { comparisons, swaps },
  });
  return trace.finish();
}
export function shellCodeTrace(input: number[], sequence = 'halving') {
  const a = [...input],
    gaps = [];
  if (sequence === 'knuth') {
    let h = 1;
    while (h < a.length / 3) h = 3 * h + 1;
    for (; h >= 1; h = Math.floor(h / 3)) gaps.push(h);
  } else for (let h = Math.floor(a.length / 2); h > 0; h = Math.floor(h / 2)) gaps.push(h);
  const trace = recorder(
    [
      'def shell_sort(values, gaps):',
      '    a = list(values)',
      '    for gap in gaps:',
      '        for i in range(gap, len(a)):',
      '            key = a[i]',
      '            j = i',
      '            while j >= gap and a[j - gap] > key:',
      '                a[j] = a[j - gap]',
      '                j -= gap',
      '            a[j] = key',
      '    return a',
    ],
    'Shell sort: one spaced insertion at a time.',
    'The supplied gap sequence is descending and ends in one. Group membership follows indices, not values.',
  );
  let comparisons = 0,
    shifts = 0;
  const rows = (active = [], group = []) => [
    { label: 'One array — highlighted positions form the active gap group', values: a, active, group },
  ];
  trace.add({
    title: 'Create the working array',
    why: `Gaps: ${gaps.join(', ') || 'none for empty/singleton input'}. No values have moved.`,
    lines: [1],
    rows: rows(),
    variables: { comparisons, shifts },
  });
  for (const gap of gaps) {
    const groups = Array.from({ length: gap }, (_, r) => ({
      label: `Group ${r}: indices ${Array.from({ length: Math.ceil((a.length - r) / gap) }, (_, k) => r + k * gap).join(', ')}`,
      values: a.filter((_, i) => i % gap === r),
    }));
    trace.add({
      title: `Separate the gap-${gap} groups`,
      why: 'These rows are views into one array, not new arrays. Insertion operates within one residue class.',
      lines: [2],
      rows: [...rows(), ...groups],
      variables: { gap, comparisons, shifts },
    });
    for (let i = gap; i < a.length; i++) {
      const key = a[i];
      let j = i;
      const group = a.map((_, k) => k).filter((k) => k % gap === i % gap);
      trace.add({
        title: `Hold key ${key} from index ${i}`,
        why: 'Keep the key in a variable while larger group values shift. Other gap groups stay untouched.',
        lines: [4, 5],
        rows: rows([i], group),
        variables: { gap, i, j, key, comparisons, shifts },
      });
      while (j >= gap) {
        comparisons++;
        trace.add({
          title: `Compare key with index ${j - gap}`,
          why: `Compare ${a[j - gap]} with held key ${key}. The distance is exactly gap ${gap}.`,
          lines: [6],
          rows: rows([j - gap, j], group),
          variables: { gap, i, j, key, comparisons, shifts },
        });
        if (a[j - gap] <= key) break;
        a[j] = a[j - gap];
        shifts++;
        trace.add({
          title: `Shift ${a[j]} into index ${j}`,
          why: 'The temporary duplicate is expected: the key is safely held outside the array.',
          lines: [7],
          rows: rows([j - gap, j], group),
          variables: { gap, i, j, key, comparisons, shifts },
        });
        j -= gap;
        trace.add({
          title: `Move the open slot to ${j}`,
          why: 'Move by gap, not by one. This is the difference from ordinary insertion sort.',
          lines: [8],
          rows: rows([j], group),
          variables: { gap, i, j, key, comparisons, shifts },
        });
      }
      a[j] = key;
      trace.add({
        title: `Insert key at ${j}`,
        why: 'The processed prefix of this spaced group is ordered. It does not yet guarantee adjacent array order.',
        lines: [9],
        rows: rows([j], group),
        variables: { gap, i, j, key, comparisons, shifts },
      });
    }
  }
  trace.add({
    title: 'Return the fully ordered array',
    why: 'The last gap-one pass includes every position, so its invariant establishes the complete sorted order.',
    lines: [10],
    rows: [{ label: 'Sorted result', values: a, settled: a.map((_, i) => i) }],
    variables: { comparisons, shifts },
  });
  return trace.finish();
}
