// Teaching models for the dominant operation. Curves are operation-growth
// illustrations, not measurements or promises of exact comparison totals.
const log2 = (n) => Math.log2(Math.max(2, n));
const triangular = (n) => (n * (n - 1)) / 2;

export const growthModels = {
  selection: {
    operation: 'Element comparisons',
    note: 'Selection Sort scans every remaining suffix, even when the input is already ordered. Its comparison count is the same in all three cases; swaps are a separate, smaller count.',
    cases: {
      best: { formula: 'n(n − 1) / 2', value: triangular },
      average: { formula: 'n(n − 1) / 2', value: triangular },
      worst: { formula: 'n(n − 1) / 2', value: triangular },
    },
  },
  insertion: {
    operation: 'Element comparisons (representative model)',
    note: 'Best assumes an already sorted input. Average uses the standard random-permutation growth model; exact counts vary with the input order.',
    cases: {
      best: { formula: 'n − 1', value: (n) => Math.max(0, n - 1) },
      average: { formula: '≈ n² / 4', value: (n) => (n * n) / 4 },
      worst: { formula: 'n(n − 1) / 2', value: triangular },
    },
  },
  merge: {
    operation: 'Front-to-front comparisons (normalized growth model)',
    note: 'All cases grow as Θ(n log n). The separated curves are normalized illustrations of best-to-worst comparison growth, not exact totals; split sizes and input order change the constants.',
    cases: {
      best: { formula: '≈ 0.5 n log₂ n', value: (n) => 0.5 * n * log2(n) },
      average: { formula: '≈ 0.75 n log₂ n', value: (n) => 0.75 * n * log2(n) },
      worst: { formula: '≈ n log₂ n', value: (n) => n * log2(n) },
    },
  },
  tim: {
    operation: 'Run scans + merge comparisons (teaching model)',
    note: 'Best assumes one natural run already covers the input. Average and worst use the same Θ(n log n) shape here; actual TimSort work depends on run structure and merge policy.',
    cases: {
      best: { formula: 'n − 1', value: (n) => Math.max(0, n - 1) },
      average: { formula: '≈ n log₂ n', value: (n) => n * log2(n) },
      worst: { formula: '≈ n log₂ n', value: (n) => n * log2(n) },
    },
  },
  quick: {
    operation: 'Partition comparisons (representative model)',
    note: 'Best and average assume reasonably balanced partitions. Worst assumes the pivot repeatedly leaves one empty side. The average curve is a standard growth illustration, not an exact count for every pivot rule.',
    cases: {
      best: { formula: '≈ n log₂ n', value: (n) => n * log2(n) },
      average: { formula: '≈ 1.39 n log₂ n', value: (n) => 1.39 * n * log2(n) },
      worst: { formula: 'n(n − 1) / 2', value: triangular },
    },
  },
  shell: {
    operation: 'Gap-based comparisons (illustrative model)',
    note: 'Shell Sort has no single sequence-independent case curve. These representative shapes help compare growth only; exact analysis depends on the chosen gaps and input. Change the gap sequence to see how the model changes.',
    cases: {
      best: { formula: '≈ n × number of gaps', value: (n, _k, gaps) => n * gaps },
      average: { formula: '≈ n^1.5 (illustrative)', value: (n, _k, gaps) => n ** 1.5 * (gaps / Math.max(1, Math.ceil(log2(n)))) },
      worst: { formula: '≤ n² (safe halving-gap envelope)', value: (n, _k, gaps) => n * n * (gaps / Math.max(1, Math.ceil(log2(n)))) },
    },
  },
  counting: {
    operation: 'Input visits + count-range work',
    note: 'For fixed n and range width k, all cases do Θ(n + k) work. The three lines overlap because this algorithm’s work is driven by input length and range size, not whether values arrive sorted.',
    cases: {
      best: { formula: 'n + k', value: (n, k) => n + k },
      average: { formula: 'n + k', value: (n, k) => n + k },
      worst: { formula: 'n + k', value: (n, k) => n + k },
    },
  },
};

export function countShellGaps(n, sequence) {
  let count = 0;
  if (sequence === 'knuth') {
    let gap = 1;
    while (gap < n) { count += 1; gap = 3 * gap + 1; }
  } else {
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) count += 1;
  }
  return Math.max(1, count);
}
