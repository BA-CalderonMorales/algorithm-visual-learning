import { recorder } from '../shared/trace/model.ts';
export function comparisonTrace(values: number[]) {
  if (values.length !== 3 || new Set(values).size !== 3)
    throw new Error('Use exactly three distinct integers for this decision experiment.');
  const order = [0, 1, 2],
    names = ['A', 'B', 'C'];
  let candidates = [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ],
    comparisons = 0;
  const trace = recorder(
    [
      'def order_three(values):',
      '    order = [0, 1, 2]',
      '    for end in (2, 1):',
      '        for j in range(end):',
      '            if values[order[j]] > values[order[j + 1]]:',
      '                order[j], order[j + 1] = order[j + 1], order[j]',
      '    return order',
    ],
    'Comparison lower bound: eliminate possible orders.',
    'The diagram lists candidate identity orders; it is instrumentation, not memory allocated by order_three. Three distinct items have 3!=6 possible orders. A binary decision tree of height h has at most 2^h leaves, so its worst-case height is at least ceil(log₂6)=3. In general log₂(n!)=Θ(n log n).',
  );
  const add = (title, why, lines, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Original identity → value', values: values.map((v, i) => `${names[i]}: ${v}`) },
        { label: 'Working order of identities', values: order.map((i) => names[i]) },
        {
          label: 'Possible increasing identity orders',
          values: candidates.map((c) => c.map((i) => names[i]).join(' ')),
        },
      ],
      variables: { comparisons, 'candidate orders': candidates.length, 'minimum worst-case depth': 3, ...extra },
    });
  add(
    'Begin with six possible orders',
    'Before comparisons, any permutation of A, B and C could be the increasing order.',
    [1],
  );
  for (const end of [2, 1])
    for (let j = 0; j < end; j++) {
      const left = order[j],
        right = order[j + 1],
        swap = values[left] > values[right];
      comparisons++;
      candidates = candidates.filter((c) =>
        swap ? c.indexOf(left) > c.indexOf(right) : c.indexOf(left) < c.indexOf(right),
      );
      add(
        `Compare ${names[left]} and ${names[right]}`,
        `The result ${names[left]} ${swap ? '>' : '<'} ${names[right]} excludes every candidate with the opposite ordering. A comparison need not split the remaining candidates evenly.`,
        [4],
        { left: names[left], right: names[right], result: swap ? '>' : '<' },
      );
      if (swap) {
        [order[j], order[j + 1]] = [order[j + 1], order[j]];
        add(
          'Swap the out-of-order identities',
          'The working array changes, but original identity labels and comparison facts remain fixed.',
          [5],
        );
      }
    }
  add(
    'Return the determined identity order',
    'One candidate remains. This concrete execution illustrates comparison decisions; the leaf-count argument establishes the general lower bound.',
    [6],
  );
  return trace.finish();
}
