import { recorder } from '../shared/trace/model.ts';
export function inductionTrace(k: number) {
  const code = [
    'Claim P(n): 1 + 2 + … + n = n(n + 1)/2, n ≥ 1',
    'Base: P(1) is 1 = 1·2/2',
    'Assume P(k) for an arbitrary k ≥ 1',
    'S(k + 1) = S(k) + (k + 1)',
    'Replace S(k) using the hypothesis: k(k + 1)/2 + (k + 1)',
    'Factor: (k + 1)(k + 2)/2',
    'This is P(k + 1); base + bridge establish every n ≥ 1',
  ];
  const trace = recorder(
    code,
    'Induction: preserve the whole old sum.',
    'The diagram illustrates your chosen k. A finite picture is not a proof for every n; the symbolic argument uses arbitrary k.',
  );
  const old = Array.from({ length: k }, (_, r) =>
    Array.from({ length: r + 1 }, (_, c) => ({ row: r, column: c, value: '1', role: 'settled' })),
  ).flat();
  const fresh = Array.from({ length: k + 1 }, (_, c) => ({ row: k, column: c, value: '1', role: 'active' }));
  const scenes = [
    ['State the whole proposition', 'The claim concerns the sum, not merely its last term.', [0], []],
    [
      'Check the first valid case',
      'At n=1, both sides equal one. This starts the logical chain.',
      [1],
      [{ row: 0, column: 0, value: '1', role: 'active' }],
    ],
    ['Assume the whole old sum', 'The hypothesis is available only at k. Do not assume P(k+1).', [2], old],
    [
      'Add exactly one new row',
      'The old k rows remain unchanged; the new row contains k+1 units.',
      [3],
      [...old, ...fresh],
    ],
    [
      'Use the induction hypothesis',
      'Replace S(k), the entire green region, with k(k+1)/2. Keep the blue row as a separate added term.',
      [4],
      [...old, ...fresh],
    ],
    ['Factor into the next formula', 'Both terms share k+1. Factoring gives (k+1)(k+2)/2.', [5], [...old, ...fresh]],
    [
      'Close the bridge',
      'The expression matches the claim at k+1 for arbitrary k. The picture supports the reasoning; it does not replace it.',
      [6],
      [...old, ...fresh],
    ],
  ];
  for (const [title, why, lines, grid] of scenes)
    trace.add({
      title,
      why,
      lines,
      grid,
      variables: {
        'illustrated k': k,
        'old sum': (k * (k + 1)) / 2,
        'new term': k + 1,
        'next sum': ((k + 1) * (k + 2)) / 2,
      },
    });
  const result = trace.finish();
  result.language = 'Proof steps';
  return result;
}
export function telescopeTrace(n: number) {
  const code = [
    'S(n) = Σ from i=1 to n of 1/[i(i+1)]',
    'Rewrite each term as 1/i − 1/(i+1)',
    'Match a negative term with the next positive term',
    'Cancel interior pairs; preserve the endpoints',
    'S(n) = 1 − 1/(n+1)',
  ];
  const trace = recorder(
    code,
    'Telescoping: track terms that actually cancel.',
    'The chosen n illustrates the identity. Interior cancellation follows from matching symbols, not similar decimal approximations.',
  );
  const terms = Array.from({ length: n }, (_, i) => `1/${(i + 1) * (i + 2)}`);
  trace.add({
    title: 'Start with the original fractions',
    why: 'Each denominator is i(i+1). No cancellation is visible until terms are rewritten.',
    lines: [0],
    rows: [{ label: 'Original terms', values: terms }],
    variables: { n },
  });
  const expanded = Array.from({ length: n }, (_, i) => [`+1/${i + 1}`, `−1/${i + 2}`]).flat();
  trace.add({
    title: 'Rewrite into differences',
    why: '1/i − 1/(i+1) has numerator (i+1)−i=1 over denominator i(i+1).',
    lines: [1],
    rows: [{ label: 'Expanded terms', values: expanded }],
    variables: { n },
  });
  const removed = [];
  for (let i = 1; i < n; i++) {
    removed.push(2 * i - 1, 2 * i);
    trace.add({
      title: `Cancel −1/${i + 1} with +1/${i + 1}`,
      why: 'These terms are additive opposites. Their signs matter.',
      lines: [2, 3],
      rows: [
        {
          label: 'Expanded expression — green terms cancel in pairs',
          values: expanded,
          settled: removed,
          active: [2 * i - 1, 2 * i],
        },
      ],
      variables: { n, 'pairs cancelled': i },
    });
  }
  trace.add({
    title: 'Keep the two endpoints',
    why: 'The first positive term and last negative term have no opposite partner.',
    lines: [4],
    rows: [{ label: 'Survivors', values: ['1', `−1/${n + 1}`] }],
    variables: { n, 'exact result': `${n}/${n + 1}` },
  });
  const result = trace.finish();
  result.language = 'Algebra steps';
  return result;
}
