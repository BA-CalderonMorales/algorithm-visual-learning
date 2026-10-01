// Case definitions shared by Complexity and Growth. Normalized curves use
// coefficient 1; exact counts are explicitly identified.
const linear = n => n;
const quadratic = n => n * n;
const linearithmic = n => n * Math.log2(Math.max(1, n));
const model = (bound, assumption, formula, value, kind = 'Growth model') => ({ bound, assumption, formula, value, kind });
const sameCases = definition => Object.fromEntries(['best', 'average', 'worst'].map(key => [key, { ...definition }]));

export const growthModels = {
  selection: {
    operation: 'Element comparisons',
    note: 'Every input order requires the same suffix scans. n(n − 1) / 2 is the exact comparison count; its dominant term grows as Θ(n²). All three lines overlap. Swaps are a separate count.',
    cases: sameCases(model('Θ(n²)', 'Every input order requires a full scan of each remaining suffix.', 'n(n − 1) / 2', n => n * (n - 1) / 2, 'Exact comparison count')),
  },
  insertion: {
    operation: 'Comparison growth',
    note: 'The curves show dominant growth with coefficient 1, not exact totals. Average assumes a uniformly random permutation of distinct values. Average and worst overlap because both grow quadratically, although their actual counts differ.',
    cases: {
      best: model('Θ(n)', 'Already sorted: each key stops at its first comparison.', 'n', linear),
      average: model('Θ(n²)', 'Uniformly random input order: keys usually move through part of the sorted prefix.', 'n²', quadratic),
      worst: model('Θ(n²)', 'Reverse order: every key moves across the whole sorted prefix.', 'n²', quadratic),
    },
  },
  merge: {
    operation: 'Split-and-merge work growth',
    note: 'This standard version merges at every level, even for sorted input. All cases grow as Θ(n log n), so normalized lines overlap. A version that skips already ordered merges can have a different best case; this walkthrough does not use that optimization.',
    cases: {
      best: model('Θ(n log n)', 'Standard Merge Sort still processes every merge level on already sorted input.', 'n log₂ n', linearithmic),
      average: model('Θ(n log n)', 'Random input order: each level processes n values across the merges.', 'n log₂ n', linearithmic),
      worst: model('Θ(n log n)', 'Even the most interleaved halves require only linear work per merge level.', 'n log₂ n', linearithmic),
    },
  },
  tim: {
    operation: 'Run scans and merge work growth',
    note: 'One natural ordered run gives linear work. Average and worst share the normalized n log₂ n curve. These are standard TimSort growth classes; the small-run walkthrough is a teaching illustration.',
    cases: {
      best: model('Θ(n)', 'The input is already one ordered run, so a scan finishes it.', 'n', linear),
      average: model('Θ(n log n)', 'General input contains multiple runs that need extending and merging.', 'n log₂ n', linearithmic),
      worst: model('Θ(n log n)', 'Many short runs require the full merge work.', 'n log₂ n', linearithmic),
    },
  },
  quick: {
    operation: 'Partition work growth',
    note: 'Best and expected average share a normalized n log₂ n curve; equal growth classes do not mean identical counts. Average assumes uniformly random input order with distinct values. Repeatedly uneven partitions give quadratic worst-case work, even with median-of-three.',
    cases: {
      best: model('Θ(n log n)', 'Partitions stay balanced, giving logarithmically many levels.', 'n log₂ n', linearithmic),
      average: model('Θ(n log n)', 'Expected work for uniformly random input order with distinct values.', 'n log₂ n', linearithmic),
      worst: model('Θ(n²)', 'Partitions repeatedly leave one side very small.', 'n²', quadratic),
    },
  },
  shell: {
    operation: 'Gap-based comparison growth',
    note: 'These cases use the halving gaps from the walkthrough: floor(n/2), floor(n/4), …, 1. Sorted input only scans each gap group. The worst-case curve shows quadratic growth. Average needs a stated distribution and supporting analysis; no unsupported average curve is drawn.',
    cases: {
      best: model('Θ(n log n)', 'Already sorted input with halving gaps: a scan for each of logarithmically many gaps.', 'Σ(n − gap) over halving gaps', n => shellGaps(n).reduce((work, gap) => work + n - gap, 0), 'Exact sorted-input comparison count'),
      average: model('Not specified', 'No average-case formula is assumed for halving gaps here.', 'No supported curve', null, 'Not plotted'),
      worst: model('Θ(n²)', 'Halving gaps can require quadratic comparison work.', 'n²', quadratic),
    },
  },
  counting: {
    operation: 'Input visits and count-range work growth',
    note: 'For the same n and range width k, every input order takes Θ(n + k) work. Normalized lines overlap. n + k is the dominant growth, not an exact implementation count. Here k = max − min + 1.',
    cases: sameCases(model('Θ(n + k)', 'Process n input items and k count buckets, regardless of input order.', 'n + k', (n, k) => n + k)),
  },
};

function shellGaps(n, sequence = 'halving') {
  const gaps = [];
  if (sequence === 'knuth') {
    let gap = 1;
    while (gap < n / 3) gap = 3 * gap + 1;
    for (; gap >= 1; gap = Math.floor(gap / 3)) gaps.push(gap);
    return gaps;
  }
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) gaps.push(gap);
  return gaps;
}

export function countShellGaps(n, sequence = 'halving') {
  return shellGaps(n, sequence).length;
}

export function getGrowthModel(id, sequence = 'halving') {
  if (id !== 'shell' || sequence === 'halving') return growthModels[id];
  return {
    ...growthModels.shell,
    note: 'Knuth gaps use 1, 4, 13, … . Sorted input scans each gap group; the worst-case comparison growth is Θ(n^1.5). The average-case curve is unspecified. The walkthrough uses halving gaps, so select Halving to match its version.',
    cases: {
      best: model('Θ(n log n)', 'Already sorted input with Knuth gaps: a scan for each of logarithmically many gaps.', 'Σ(n − gap) over Knuth gaps', n => shellGaps(n, 'knuth').reduce((work, gap) => work + n - gap, 0), 'Exact sorted-input comparison count'),
      average: model('Not specified', 'No average-case formula is assumed for Knuth gaps here.', 'No supported curve', null, 'Not plotted'),
      worst: model('Θ(n^1.5)', 'Knuth gaps have a tight n^1.5 worst-case comparison bound.', 'n^1.5', n => n ** 1.5),
    },
  };
}
