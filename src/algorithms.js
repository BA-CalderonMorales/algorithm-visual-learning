// Model: algorithm facts and learning cues stay separate from the Svelte view.
export const algorithms = [
  {
    id: 'quick',
    name: 'Quick Sort',
    cue: 'Choose a pivot → partition → recurse on each side.',
    divide: 'Yes',
    lower: 'Ω(n log n), balanced partitions',
    upper: 'O(n²)',
    extra: 'Insertion sort handles small ranges in this walkthrough.',
    walkthrough: 'quick_sort_partition_walkthrough.html',
    python: 'quick_sort.py',
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    cue: 'Split to singles → compare the fronts → merge.',
    divide: 'Yes',
    lower: 'Ω(n log n)',
    upper: 'O(n log n)',
    extra: 'Θ(n) auxiliary space.',
    walkthrough: 'merge_sort_walkthrough.html',
    python: 'merge_sort.py',
  },
  {
    id: 'tim',
    name: 'Tim Sort',
    cue: 'Find ordered runs → extend short runs → merge.',
    divide: 'Yes, while merging runs',
    lower: 'Ω(n), when the data is already one ordered run',
    upper: 'O(n log n)',
    extra: 'Adaptive hybrid; Python file is an educational version.',
    walkthrough: 'tim_sort_walkthrough.html',
    python: 'tim_sort.py',
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    cue: 'Grow a sorted prefix → shift larger values → insert the key.',
    divide: 'No',
    lower: 'Ω(n), already ordered input',
    upper: 'O(n²)',
    extra: 'Θ(1) auxiliary space.',
    walkthrough: 'insertion_sort_walkthrough.html',
    python: 'insertion_sort.py',
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    cue: 'Scan the unsorted suffix → choose its minimum → swap.',
    divide: 'No',
    lower: 'Ω(n²) comparisons',
    upper: 'O(n²)',
    extra: 'At most n−1 swaps.',
    walkthrough: 'selection_sort_walkthrough.html',
    python: 'selection_sort.py',
  },
  {
    id: 'shell',
    name: 'Shell Sort',
    cue: 'Compare within gap groups → shrink the gap → finish at gap one.',
    divide: 'No',
    lower: 'Θ(n log n), already ordered input with halving gaps',
    upper: 'O(n²), halving-gap sequence',
    extra: 'Runtime bounds depend on the gap sequence.',
    walkthrough: 'shell_sort_walkthrough.html',
    python: 'shell_sort.py',
  },
  {
    id: 'counting',
    name: 'Counting Sort',
    cue: 'Count values → cumulative positions → place right-to-left.',
    divide: 'No',
    lower: 'Θ(n + k)',
    upper: 'O(n + k)',
    extra: 'k is the integer range width; supports negative values.',
    walkthrough: 'counting_sort_walkthrough.html',
    python: 'counting_sort.py',
  },
];

// View-model projection: search never mutates the algorithm records.
export function visibleAlgorithms(query) {
  const term = query.trim().toLowerCase();
  if (!term) return algorithms;
  return algorithms.filter((algorithm) =>
    [algorithm.name, algorithm.cue, algorithm.divide, algorithm.lower, algorithm.upper, algorithm.extra]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );
}

