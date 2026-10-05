// Original explanations and examples. Hello Interview is a further-reading
// destination and pattern reference, not a source of copied lesson material.
export const lessons = [
  {
    id: 'two-sum',
    title: 'Two Sum (Sorted Array)',
    question: 'Why can a single comparison rule out a whole endpoint?',
    idea: 'Keep the array still. Move the search boundaries, not the values.',
    task: 'Find two distinct positions whose values add to a target. Return a pair of zero-based indices, or no pair.',
    precondition:
      'Input must already be sorted in ascending order. This is not the unsorted, hash-map version of Two Sum.',
    anchor: 'sum too small → i right · sum too large → j left · equal → found',
    steps: [
      { title: 'Start wide', body: 'i is the smallest remaining value. j is the largest. Check their sum.' },
      {
        title: 'Rule out one end',
        body: 'Too small? Even the largest partner cannot rescue i. Too large? Even the smallest partner cannot rescue j.',
      },
      {
        title: 'Stop at a pair or a crossing',
        body: 'Only compare while i < j. You cannot use the same position twice.',
      },
    ],
    proof:
      'If A[i] + A[j] is below the target, every available partner for A[i] is at most A[j]. Those sums are also too small. Discard i. The mirror argument discards j when the sum is too large.',
    trap: 'Moving an endpoint is justified by sorted order—not by the fact that there happen to be two pointers.',
    time: 'O(n) worst-case scan',
    space: 'O(1) extra space',
    cost: 'At most n − 1 pair checks: every unsuccessful check shrinks j − i by one. An immediate match needs just one check.',
    reference: 'https://www.hellointerview.com/learn/code/two-pointers/overview',
    checks: [
      {
        question: 'With [1, 3, 5, 7, 9, 12] and target 14, why move i after 1 + 12 = 13?',
        answer: '12 is already the biggest partner available. Keeping 1 and choosing anything smaller cannot reach 14.',
      },
      {
        question: 'Now 3 + 12 = 15. Why not move i again?',
        answer: 'A bigger left value only increases the sum. Discard 12 by moving j left.',
      },
      {
        question: 'Can [7] satisfy target 14?',
        answer: 'No. The two positions must be distinct; i < j prevents reusing the same 7.',
      },
      {
        question: 'What about an unsorted input?',
        answer:
          'This elimination proof fails. Use a different approach, or sort while preserving original indices if the task requires them.',
      },
    ],
    connections: [
      { title: 'What sorting establishes', href: '#/algorithms/merge/understand' },
      { title: 'Why two moving boundaries are still linear', href: '#/complexity/time/understand' },
    ],
  },
  {
    id: 'container',
    title: 'Container With Most Water',
    question: 'Why move the shorter wall—even when that makes the next area worse?',
    idea: 'Width gets smaller. Only a taller limiting wall can make up for it.',
    task: 'Choose two nonnegative wall heights. Maximize the rectangle between them: distance × shorter height.',
    precondition:
      'Keep the heights in their original order. Their indices are physical positions; sorting changes the containers.',
    anchor: 'area = (j − i) × min(height[i], height[j])',
    steps: [
      {
        title: 'Measure the current walls',
        body: 'Use the shorter wall as the water level. Interior bars do not subtract from this rectangle.',
      },
      {
        title: 'Remember the best',
        body: 'Save the largest area seen. The next area may be worse; do not throw away the record.',
      },
      {
        title: 'Retire the shorter wall',
        body: 'Keeping that wall and narrowing the width cannot beat the area you just measured.',
      },
    ],
    proof:
      'Suppose the left wall is shorter. Every narrower container that keeps it has height at most that left height and less width. None can improve the current area. So retire the left wall. If the walls tie, either endpoint is safe to retire.',
    trap: 'This is not Trapping Rain Water. We choose two walls and maximize one rectangle; we do not total water over every position.',
    time: 'Θ(n) scan',
    space: 'O(1) extra space',
    cost: 'The demo performs n − 1 checks. Each check retires one wall. Store two indices and one best area—not every possible container.',
    reference: 'https://www.hellointerview.com/learn/code/two-pointers/container-with-most-water',
    checks: [
      {
        question: 'For heights [3, 8, 2, 6, 4, 7], what limits walls 0 and 5?',
        answer: 'Height 3. Width is 5, so area is 15. The taller 7 cannot raise the water above the 3.',
      },
      {
        question: 'Why not move the taller wall first?',
        answer:
          'Keeping height 3 leaves the water level at most 3 while the width shrinks. You cannot beat 15 that way.',
      },
      {
        question: 'If the next area drops, did the algorithm make a mistake?',
        answer:
          'No. A safe discard is not a promise of immediate improvement. The best-so-far record protects the answer.',
      },
      {
        question: 'What if both walls have the same height?',
        answer: 'Either can move. Holding either equal wall while narrowing cannot improve the current area.',
      },
    ],
    connections: [
      { title: 'Bound the work, not the next result', href: '#/complexity/asymptotic/understand' },
      { title: 'Auxiliary memory versus input', href: '#/complexity/space/understand' },
    ],
  },
  {
    id: 'three-sum',
    title: '3-Sum',
    question: 'How does a three-value question turn back into a pair search?',
    idea: 'Fix one value. The remaining two must add to its opposite.',
    task: 'Find all unique value triplets that sum to zero, using three distinct positions.',
    precondition: 'Sort a copy first. k holds an anchor; i and j search only the positions to its right.',
    anchor: 'A[k] + A[i] + A[j] = 0 → pair target = −A[k]',
    steps: [
      { title: 'Fix an anchor', body: 'Choose k. Start i at k + 1 and j at the final index.' },
      {
        title: 'Reuse the pair search',
        body: 'A total below zero needs i to move right. A total above zero needs j to move left.',
      },
      {
        title: 'Keep unique answers',
        body: 'After a match, move both ends and skip repeated values. Skip repeated anchors too.',
      },
    ],
    proof:
      'With k fixed, −A[k] is just a Two Sum target. Sorting justifies each pair move. Restricting the pair to positions after k keeps all three indices distinct; skipping equal anchors and equal matched values prevents repeating a value triplet.',
    trap: 'Do not remove duplicates from the input. The answer [−1, −1, 2] needs two different positions containing −1.',
    time: 'O(n²) worst-case search',
    space: 'O(n) sorted copy + output',
    cost: 'There are O(n) anchors and an O(n) pair scan for each. Sorting adds O(n log n), which does not dominate n². This demo preserves the input with a copy; sorting workspace depends on the implementation.',
    reference: 'https://www.hellointerview.com/learn/code/two-pointers/3-sum',
    checks: [
      {
        question: 'With anchor −3, what must the remaining pair sum to?',
        answer: '3. We are solving Two Sum in the suffix with target −(−3) = 3.',
      },
      {
        question: 'Why begin i at k + 1?',
        answer:
          'The anchor cannot be reused. Searching to its right also prevents rediscovering the same three positions in different orders.',
      },
      {
        question: 'Why keep duplicate −1 values in the array?',
        answer: 'They can form a valid triplet: −1 + −1 + 2 = 0. Skip duplicate answers, not necessary input values.',
      },
      {
        question: 'Why does this take more than linear time?',
        answer:
          'The pair scan is linear for one anchor. Repeating it across O(n) anchors gives an O(n²) worst-case search.',
      },
    ],
    connections: [
      { title: 'How a sorted pair search works', href: '#/problems/two-pointers/two-sum/understand' },
      { title: 'Repeated linear scans', href: '#/complexity/time/visualize' },
    ],
  },
];
