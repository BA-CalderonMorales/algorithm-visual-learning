import { recorder } from '../shared/trace/model.ts';
export function oddSumTrace(k: number) {
  const code = [
    'Claim P(n): 1 + 3 + … + (2n−1) = n², n ≥ 1',
    'Base P(1): 1 = 1²',
    'Assume the whole sum S(k) = k² for arbitrary k ≥ 1',
    'S(k+1) = S(k) + [2(k+1)−1]',
    'Substitute: k² + (2k+1)',
    'Factor: k² + 2k + 1 = (k+1)²',
    'P(k) implies P(k+1); the base case starts the chain',
  ];
  const trace = recorder(
    code,
    'Odd sums: one new border grows the square.',
    'k is a chosen illustration. The induction hypothesis concerns the entire old sum; the symbolic bridge uses arbitrary k.',
  );
  const old = Array.from({ length: k }, (_, r) =>
    Array.from({ length: k }, (_, c) => ({ row: r, column: c, value: '1', role: 'settled' })),
  ).flat();
  const border = [
    ...Array.from({ length: k + 1 }, (_, c) => ({ row: k, column: c, value: '1', role: 'active' })),
    ...Array.from({ length: k }, (_, r) => ({ row: r, column: k, value: '1', role: 'active' })),
  ];
  const steps = [
    ['State the whole proposition', 'The last odd term alone is not n². The claim concerns their sum.', []],
    [
      'Check the base case',
      'The first sum and first square each contain one unit.',
      [{ row: 0, column: 0, value: '1', role: 'active' }],
    ],
    ['Keep the old square intact', 'Assume the first k odd terms sum to k²; do not assume the result at k+1.', old],
    [
      'Add the next odd term',
      'The new bottom row has k+1 cells and the new right column has k cells: exactly 2k+1.',
      [...old, ...border],
    ],
    [
      'Replace the whole old sum',
      'The green square is k². The blue border is 2k+1. Both parts remain in the expression.',
      [...old, ...border],
    ],
    [
      'Recognize the next square',
      'k²+2k+1 factors into (k+1)². The next square includes the complete old square.',
      [...old, ...border],
    ],
    [
      'Complete the induction bridge',
      'The algebra works for arbitrary k, not only the pictured size. Base and bridge establish every positive n.',
      [...old, ...border],
    ],
  ];
  steps.forEach(([title, why, grid], i) =>
    trace.add({
      title,
      why,
      grid,
      lines: [i],
      variables: { 'illustrated k': k, 'old sum': k * k, 'new term': 2 * k + 1, 'next sum': (k + 1) ** 2 },
    }),
  );
  const result = trace.finish();
  result.language = 'Proof steps';
  return result;
}
