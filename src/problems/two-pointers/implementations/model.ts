import { languages, languageFor } from '../../../shared/ui/code-view/languages.ts';

export const approaches = [
  { id: 'brute', label: 'Brute' },
  { id: 'better', label: 'Better' },
  { id: 'best', label: 'Best' },
];

// These are learning approaches, NOT best/average/worst input cases.
export const implementations = {
  'two-sum': {
    contract: 'Sorted input · return two distinct 0-based indices, or None / null · input unchanged.',
    example: '[2, 7, 11, 15], target 9 → (0, 1)',
    note: 'Sorted order is what makes binary search and endpoint elimination safe. For unsorted Two Sum, use a different approach (for example, a hash map).',
    functionName: 'twoSum',
    pythonName: 'two_sum',
    strategies: {
      brute: {
        title: 'Check every pair',
        time: 'O(n²)',
        space: 'O(1)',
        idea: 'Try every i < j. Nothing is discarded without checking it.',
        change: 'The baseline: up to n(n − 1)/2 pair checks.',
      },
      better: {
        title: 'Binary-search each partner',
        time: 'O(n log n)',
        space: 'O(1)',
        idea: 'Fix i, then search the sorted suffix for target − A[i].',
        change: 'Replace the inner linear scan with binary search. Searching only the suffix prevents using i twice.',
      },
      best: {
        title: 'Discard one endpoint',
        time: 'O(n)',
        space: 'O(1)',
        idea: 'Too small? Move i right. Too large? Move j left.',
        change:
          'Sorted order lets each move rule out all remaining pairs with that endpoint, not just the pair you checked.',
      },
    },
  },
  container: {
    contract:
      'Nonnegative heights · keep the walls in their original positions · return area (0 with fewer than two walls).',
    example: '[1, 8, 6, 2, 5, 4, 8, 3, 7] → 49',
    note: 'Better is a pruning improvement on some inputs, not a better worst-case bound. Never sort the heights: that would change the widths.',
    functionName: 'maxArea',
    pythonName: 'max_area',
    strategies: {
      brute: {
        title: 'Measure every pair of walls',
        time: 'O(n²)',
        space: 'O(1)',
        idea: 'Area = width × the shorter wall. Keep the largest area.',
        change: 'Use this as the correctness baseline before discarding pairs.',
      },
      better: {
        title: 'Stop unpromising inner scans',
        time: 'O(n²)',
        space: 'O(1)',
        idea: 'For one left wall, try widths from widest to narrowest.',
        change:
          'If width × left height cannot beat the best area, no narrower pair with that left wall can either. Worst case remains quadratic.',
      },
      best: {
        title: 'Move the shorter wall',
        time: 'O(n)',
        space: 'O(1)',
        idea: 'Measure the widest remaining pair, then discard its shorter wall.',
        change:
          'A narrower pair keeping the shorter wall cannot beat this pair: the height is capped and width decreases.',
      },
    },
  },
  'three-sum': {
    contract:
      'Return unique value-triplets summing to 0 · use three distinct positions · input unchanged · result order is not significant.',
    example: '[-1, 0, 1, 2, -1, -4] → (-1, -1, 2), (-1, 0, 1)',
    note: 'n = input length; z = unique answers. Space below excludes the returned output (O(z)). Best means our preferred sorted-pointer approach, not a universal optimality claim.',
    functionName: 'threeSum',
    pythonName: 'three_sum',
    strategies: {
      brute: {
        title: 'Try every triple',
        time: 'O(n³)',
        space: 'O(z)',
        idea: 'Check a < i < j, then normalize each matching triplet.',
        change:
          'A deduplication set avoids repeated value-triplets. Its O(z) storage is separate from the returned output list.',
      },
      better: {
        title: 'Fix one value; remember partners',
        time: 'O(n²) expected',
        space: 'O(n + z)',
        idea: 'For each anchor, use a set to find the missing third value.',
        change: 'Expected constant-time hash lookups remove one loop. A set of answers still handles duplicates.',
      },
      best: {
        title: 'Sort, anchor, then scan inward',
        time: 'O(n²)',
        space: 'O(n)',
        idea: 'Fix an anchor and solve a sorted Two Sum in the remaining suffix.',
        change:
          'Skip equal anchors and equal endpoints to avoid duplicates without a global answer set. The sorted copy uses O(n) working space; sorting O(n log n) is included in the time bound.',
      },
    },
  },
};

export function implementationHref(id: string, approach = 'brute', language = 'python-simple') {
  return `#/problems/two-pointers/${id}/implementations/${approach}/${languageFor(language).path}`;
}

export function implementationSelection(tail: string) {
  if (!tail) return { approach: 'brute', language: 'python-simple' };
  const [approach, ...parts] = tail.split('/');
  if (!approaches.some((entry) => entry.id === approach)) return null;
  const language = parts.length ? languages.find((entry) => entry.path === parts.join('/')) : languages[0];
  return language ? { approach, language: language.id } : null;
}
