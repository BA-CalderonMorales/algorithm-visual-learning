const q = (prompt, options, explanation) => ({ prompt, options, answer: 0, explanation });
export const exercises = {
  time: [
    q(
      'A loop runs n² times, doing n additions each time. How many additions occur?',
      ['Θ(n³)', 'Θ(n²)', 'Θ(n)'],
      'Multiply executed work: n² × n. Count the bound, not the number of written loop headers.',
    ),
    q(
      'Let m = n². For i from 0 to m−1, j ranges from i to m−1. Only when j=i, an inner loop runs 2i times. What is total growth?',
      ['Θ(n⁴)', 'Θ(n²)', 'Θ(n⁶)'],
      'The triangular j-loop costs Θ(m²). The conditional inner work totals Σ2i = Θ(m²) too. Substitute m=n²: Θ(n⁴).',
    ),
    q(
      'A window repeatedly removes its leftmost item. Each item enters and leaves at most once. Total boundary movement?',
      ['O(n)', 'O(n²) just because loops are nested', 'O(log n)'],
      'Across the whole scan there are at most n insertions and n removals. Analyze executions, not indentation.',
    ),
    q(
      'Does a measured runtime remain identical across hardware and software environments?',
      [
        'No; measurement depends on the environment',
        'Yes; experiments remove hardware effects',
        'Only if input is sorted',
      ],
      'An abstract operation-count model and a wall-clock experiment answer different questions.',
    ),
  ],
  master: [
    q(
      'Two mutually exclusive branches each contain one call on floor(n/2). Each call also does Θ(n) local work. What recurrence describes one execution?',
      ['T(n)=T(n/2)+Θ(n)', 'T(n)=2T(n/2)+Θ(n)', 'T(n)=T(n−1)+Θ(1)'],
      'Only one branch executes. Count calls made per invocation, not every call expression appearing in the source.',
    ),
    q(
      'Three calls of size n/2 and Θ(n) local work: which grows faster?',
      ['The leaves: n^(log₂3)', 'The root work n', 'They have equal growth'],
      'Compare f(n)=n against n^(log₂3). Since log₂3>1, recursive work dominates.',
    ),
    q(
      'One recursive call of size n−1 plus Θ(n) local work. Which method fits?',
      [
        'Sum n+(n−1)+…+1, yielding Θ(n²)',
        'Apply the fixed-fraction Master theorem directly',
        'Multiply n by log n automatically',
      ],
      'Subtracting one gives linear depth. The standard Master theorem requires subproblems of size n/b for fixed b>1.',
    ),
    q(
      'Two calls of size n/4 plus Θ(n²) local work have what growth?',
      ['Θ(n²)', 'Θ(n^(log₄2))', 'Θ(n² log n)'],
      'Work shrinks geometrically across levels: n², n²/8, n²/64,… . The root dominates and regularity holds.',
    ),
  ],
  induction: [
    q(
      'Claim: 1+2+4+…+2^n = 2^(n+1)−1, where the left side lists powers of two. What should the hypothesis describe?',
      ['The entire sum through 2^k', 'Only the last term 2^k', 'The desired claim at k+1'],
      'The hypothesis is the full proposition at k. A statement about only its last term is a different claim.',
    ),
    q(
      'After assuming the sum through 2^k is 2^(k+1)−1, what is added for the next case?',
      ['2^(k+1)', 'k+1', 'The whole sum again'],
      'The next term is a power of two. Separate the old sum from this one new term.',
    ),
    q(
      'Where does the induction hypothesis enter the bridge?',
      ['Replace the old sum with its known expression', 'Assume the new result is already true', 'Check ten examples'],
      'Substitution of P(k) into P(k+1) is the justified step. Numerical examples alone do not prove the bridge.',
    ),
  ],
  shell: [
    q(
      'For gap 3 in a seven-item array, which indices share the group starting at 0?',
      ['0,3,6', '0,1,2', '0,4'],
      'Each next group index is exactly one gap farther, independent of its value.',
    ),
    q(
      'After a gap-3 pass, must adjacent array values be sorted?',
      ['No; each gap group is sorted', 'Yes; the whole array is sorted', 'Only the first three positions exist'],
      'Gap sorting establishes order within residue classes, not full adjacent order.',
    ),
    q(
      'Why must the final gap be 1?',
      [
        'Its group covers every adjacent position',
        'Gap 1 skips all comparisons',
        'It guarantees every earlier pass was correct',
      ],
      'The final pass is insertion sort on the whole array. A sorted final result does not verify earlier pass traces.',
    ),
  ],
  quick: [
    q(
      'After the first partition swap, what is the next responsibility?',
      [
        'Resume both scans under the same pivot rule',
        'Declare the partition complete',
        'Sort the whole input immediately',
      ],
      'A partition completes only when the scan condition ends and the pivot is placed. One swap is an intermediate state.',
    ),
    q(
      'Does selecting a median-of-three pivot eliminate the worst-case quadratic bound?',
      [
        'No; it improves some input cases without a universal guarantee',
        'Yes for every distinct input',
        'Only when n is even',
      ],
      'A pivot heuristic is not a proof that every recursive split stays balanced.',
    ),
    q(
      'Why name the partition scheme when checking a trace?',
      [
        'Different valid schemes can produce different intermediate states',
        'Every implementation has identical swaps',
        'The pivot value alone specifies all details',
      ],
      'Pivot placement, pointer starts, equal-value handling, and cutoff rules define the trace.',
    ),
  ],
  insertion: [
    q(
      'An adjacent out-of-order pair is swapped. How many inversions disappear?',
      ['Exactly one', 'Every inversion in the array', 'None'],
      'Only that pair changes relative order; other values remain on the same side of both adjacent items.',
    ),
    q(
      'Does swapping two distant out-of-order values always remove exactly one inversion?',
      ['No; their relationships with intervening values can change too', 'Yes', 'It always increases inversions'],
      'A distant swap can affect multiple pairs. Recount changed relationships rather than applying the adjacent-swap rule.',
    ),
    q(
      'For an already sorted input, why is insertion sort linear?',
      [
        'Each key needs only a failed comparison and no shifts',
        'There are no loop iterations',
        'Its worst case changes to logarithmic',
      ],
      'The outer scan still runs, but each inner shift loop ends immediately.',
    ),
  ],
};
