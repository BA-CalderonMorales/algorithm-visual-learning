// Short, algorithm-specific explanations shared by the Understand, Practice, and Complexity views.
export const algorithmLessons = {
  quick: {
    idea: 'Choose a pivot, move smaller values to its left and larger values to its right, then sort the two sides independently.',
    invariant: 'After a partition finishes, the pivot is in its final sorted position. Every value in S1 is at most the pivot; every value in S2 is at least the pivot.',
    example: 'For [4, 7, 2, 5, 3] with pivot 4, partitioning gives [2, 3] | 4 | [7, 5]. The two sides can now be sorted without moving 4.',
    watch: 'Follow the pivot and the two scan pointers. A regular swap exchanges the values at i and j; after the pointers cross, a[i] swaps with the pivot.',
    practice: 'After partitioning around pivot 6, S1 is [2, 4, 5] and S2 is [8, 7]. Which part can be sorted independently?',
    answer: 'Both parts. Sort [2, 4, 5] and [8, 7] independently; the pivot 6 stays between them.',
    practiceChecks: [
      { title: '1 · Choose the pivot', prompt: 'For Worksheet A [4, 7, 8, 2, 9, 5, 6, 3, 1], what values are sampled by median-of-three, and which becomes the pivot?', answer: 'The sampled values are 4, 9, and 1. Their median is 4, so 4 is selected as the pivot.' },
      { title: '2 · Read the scans', prompt: 'With the pivot at high − 1 in [1, 7, 8, 2, 3, 5, 6, 4, 9], where does I stop first? Where does J stop first?', answer: 'I stops at 7: it is not less than pivot 4. J passes 6 and 5, then stops at 3: it is not greater than 4.' },
      { title: '3 · Predict the swaps', prompt: 'The first stopped pair is 7 and 3. After swapping them, what pair stops the scans next?', answer: 'The array becomes [1, 3, 8, 2, 7, 5, 6, 4, 9]. I stops at 8 and J stops at 2, so 8 and 2 are the next pair swapped.' },
      { title: '4 · Split and recurse', prompt: 'After the pointers cross and the pivot is placed, what are S1, the pivot, and S2? Which parts still need sorting?', answer: 'The partition is [1, 3, 2] | 4 | [7, 5, 6, 8, 9]. The pivot 4 is fixed; sort S1 and S2 independently. With a cutoff of four, S1 uses insertion sort and S2 uses another quick-sort partition.' }
    ],
    best: 'Θ(n log n) when partitions stay balanced', average: 'Θ(n log n) for typical balanced partitions', worst: 'Θ(n²) when partitions repeatedly split very unevenly',
    space: 'Θ(log n) expected recursion stack; Θ(n) worst-case stack. This walkthrough uses insertion sort for small ranges.',
    note: 'Median-of-three helps avoid some poor pivots, but does not remove the Θ(n²) worst case.'
  },
  merge: {
    idea: 'Split the array into smaller ranges until each range has one value, then merge sorted ranges by repeatedly taking the smaller front value.',
    invariant: 'During a merge, the output is sorted and contains exactly the values already consumed from the two input runs.',
    example: 'Merge [2, 6, 9] and [1, 5, 8]: compare the two fronts and write 1, 2, 5, 6, 8, 9.',
    watch: 'Keep your eyes on the first unused value of each run and the growing output. A chosen value leaves one run and joins the output.',
    practice: 'The runs are [1, 7] and [3, 5]. Which value is written first, and what are the next two front values?',
    answer: 'Write 1 first. The fronts are then 7 and 3, so 3 is written next; the fronts become 7 and 5.',
    best: 'Θ(n)', average: 'Θ(n log n)', worst: 'Θ(n log n)',
    space: 'Θ(n) auxiliary array for the merge, plus Θ(log n) recursion stack.',
    note: 'The standard array-based version uses extra space to make the merge predictable and stable.'
  },
  tim: {
    idea: 'Find already ordered runs, extend short runs with insertion sort, then merge runs until the full array is ordered.',
    invariant: 'Each run tracked by the algorithm is sorted. Merging two adjacent runs creates one larger sorted run with the same values.',
    example: 'A descending run [9, 7, 4] can be reversed to [4, 7, 9], then merged with the neighboring sorted run.',
    watch: 'Notice where a run ends, how insertion extends a short run, and which two runs are being merged. Production TimSort also maintains merge-balance rules.',
    practice: 'If the input is already one ascending run, does TimSort need to merge multiple runs?',
    answer: 'No. It can recognize the single ordered run, so the work is linear in the input length.',
    best: 'Θ(n) on an already ordered input', average: 'Θ(n log n)', worst: 'Θ(n log n)',
    space: 'Up to Θ(n) temporary storage when merging, depending on the implementation.',
    note: 'The walkthrough is a teaching model of run detection, insertion extension, and merging; production TimSort has additional run-stack rules.'
  },
  insertion: {
    idea: 'Grow a sorted prefix. Hold the next key, shift larger prefix values one slot right, and insert the key into the gap.',
    invariant: 'Before each new key, the prefix to its left is sorted. After insertion, that prefix grows by one and remains sorted.',
    example: 'For [2, 5, 7, 3], hold 3, shift 7 and 5 right, then place 3 after 2: [2, 3, 5, 7].',
    watch: 'Track the key, the open slot, and the sorted prefix. Each shift moves one larger value right; the key is inserted once the left neighbor is no larger.',
    practice: 'The sorted prefix is [2, 4, 7, 8] and the key is 5. Which values shift, and where does 5 go?',
    answer: 'Shift 8 and 7 right. Stop before 4 and insert 5 between 4 and 7.',
    best: 'Θ(n) when the input is already sorted', average: 'Θ(n²)', worst: 'Θ(n²) when each key moves across the whole prefix',
    space: 'Θ(1) auxiliary space for the in-place version.',
    note: 'Insertion sort is often effective on short or nearly sorted ranges.'
  },
  selection: {
    idea: 'Scan the unsorted suffix to find its minimum, swap that value into the next open position, and grow the sorted prefix.',
    invariant: 'The prefix is sorted and contains the smallest values seen so far. The suffix contains everything not yet placed.',
    example: 'For [4, 1, 3], scan the whole suffix, find 1, and swap it with 4: [1, 4, 3]. Then scan [4, 3].',
    watch: 'The current minimum may change several times during a pass, but only the final minimum is swapped into place.',
    practice: 'In [3, 5, 1, 4], after the first full scan, which two positions swap?',
    answer: 'The first position and the position holding 1 swap, giving [1, 5, 3, 4].',
    best: 'Θ(n²) comparisons', average: 'Θ(n²) comparisons', worst: 'Θ(n²) comparisons',
    space: 'Θ(1) auxiliary space; at most n−1 swaps.',
    note: 'Even an already sorted input still needs the scans to prove each suffix minimum.'
  },
  shell: {
    idea: 'Run insertion-sort-like passes over values a fixed gap apart, then shrink the gap until a final gap-one pass finishes the sort.',
    invariant: 'After a gap pass, each group of indices with the same remainder modulo the gap is sorted within that group.',
    example: 'With gap 3, indices 0, 3, 6 form one group; indices 1, 4, 7 form another. A value moves only within its current group.',
    watch: 'Read the gap and active group before following a key. The key compares with the index one gap to its left; it returns toward the front only through that group.',
    practice: 'For gap 3, which indices are in the same group as index 2 in a 10-element array?',
    answer: 'Indices 2, 5, and 8 share the same remainder when divided by 3.',
    best: 'Depends on the gap sequence and input', average: 'Depends on the gap sequence and input', worst: 'For halving gaps, O(n²) is a safe upper bound',
    space: 'Θ(1) auxiliary space for the in-place version.',
    note: 'Shell Sort has no single sequence-independent runtime bound. Always name the gap sequence.'
  },
  counting: {
    idea: 'Count each integer value, turn counts into ending positions, then place values into an output array while preserving equal-value order.',
    invariant: 'After cumulative counts, each bucket tells the final ending index for that value. Stable placement preserves the original order of equal values.',
    example: 'For [2, 1, 2], the counts are 1→1 and 2→2. Scanning right to left places the last 2 at index 2, then 1 at index 0, then the first 2 at index 1.',
    watch: 'Follow one value through input → frequency → cumulative position → output destination. The range width k matters as much as n.',
    practice: 'If values range from −2 through 3 inclusive, what is k?',
    answer: 'k = 3 − (−2) + 1 = 6 possible integer values.',
    best: 'Θ(n + k)', average: 'Θ(n + k)', worst: 'Θ(n + k)',
    space: 'Θ(n + k) for the stable output and frequency arrays.',
    note: 'Counting Sort is useful when the integer range is not too large relative to the input.'
  }
};

