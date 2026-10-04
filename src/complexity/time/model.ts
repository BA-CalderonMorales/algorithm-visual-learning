import { n, v, o, r, f, p, par, eq } from '../../shared/study/math.ts';

export const lesson = {
  id: 'time',
  domain: 'complexity',
  slug: 'time',
  title: 'Time complexity',
  question: 'How much more work does a larger input require?',
  intro: 'Choose an operation, count it, then describe how that count grows.',
  idea: 'Time complexity describes work as a function of input size. It is not a stopwatch measurement on one computer.',
  anchor: r(n(3), p(v('n'), n(2)), o('+'), n(8), v('n'), o('+'), n(12), o('∈'), v('Θ'), par(p(v('n'), n(2)))),
  anchorLabel: 'The dominant term controls large-input growth',
  flow: [
    { title: 'Choose', body: 'Define n and the basic operation: a comparison, a write, or another fixed-cost action.' },
    {
      title: 'Count',
      body: 'Add consecutive phases. For nested loops, count how many times the inner body actually executes.',
    },
    {
      title: 'Describe',
      body: 'State the input case and growth bound separately. Give an input distribution before claiming an average.',
    },
  ],
  facts: [
    {
      label: 'Inputs · best / average / worst',
      body: 'Minimum over size-n inputs; expectation under a stated distribution; maximum over size-n inputs.',
    },
    {
      label: 'Bounds · O / Ω / Θ',
      body: 'An asymptotic upper bound; lower bound; tight bound. Any one input case can have any of these bounds.',
    },
    {
      label: 'Common growth, slow to fast',
      body: '1 → log n → n → n log n → n² → 2ⁿ → n! (for sufficiently large n).',
    },
  ],
  caution: 'Nested loops are not automatically quadratic. A shrinking range or halving update changes the count.',
  examples: [
    {
      title: 'Selection’s shrinking scans',
      intro: 'Count comparisons with the current minimum for n values.',
      steps: [
        { title: 'First pass', body: 'The first value starts as the minimum. Compare the remaining n − 1 values.' },
        { title: 'Later passes', body: 'The unsorted suffix shrinks. Counts are n − 1, n − 2, …, 1.' },
        {
          title: 'Sum',
          body: 'At n = 5: 4 + 3 + 2 + 1 = 10. In general:',
          math: eq(
            r(par(r(v('n'), o('−'), n(1))), o('+'), o('⋯'), o('+'), n(1)),
            f(r(v('n'), par(r(v('n'), o('−'), n(1)))), n(2)),
          ),
        },
      ],
      result:
        'The leading term is n²/2. Best, average, and worst comparison counts are all Θ(n²) for this selection-sort implementation.',
    },
    {
      title: 'A loop that halves',
      intro: 'Start with size = n. While size > 1, replace size with floor(size / 2).',
      steps: [
        { title: 'Trace n = 16', body: '16 → 8 → 4 → 2 → 1: four iterations.' },
        {
          title: 'Relate count to size',
          body: 'After t halvings, the size is about n/2ᵗ. Reaching 1 requires about log₂ n halvings.',
        },
      ],
      result: 'One constant-cost action per iteration gives Θ(log n) work.',
    },
    {
      title: 'Counting sort has two inputs',
      intro: 'Let n be the number of values and k = maximum − minimum + 1 be the bucket-range width.',
      steps: [
        { title: 'Count values', body: 'Read n input values to populate the buckets.' },
        { title: 'Process buckets', body: 'Visit k buckets. A stable version also places n output values.' },
      ],
      result: 'n + k + n has dominant growth Θ(n + k). A huge sparse value range can make k much larger than n.',
    },
    {
      title: 'An input case is not a bound',
      intro: 'Insertion sort runs on already sorted input versus reverse order.',
      steps: [
        { title: 'Sorted input', body: 'Each new key needs only the initial check. Best-case work is Θ(n).' },
        { title: 'Reverse order', body: 'Each new key crosses the whole sorted prefix. Worst-case work is Θ(n²).' },
      ],
      result: '“Worst” describes which input you choose; “Θ” describes how that input’s work grows.',
    },
  ],
  checks: [
    {
      question: 'Two consecutive loops each do n actions. Is the total Θ(n²)?',
      answer: 'No. Add their work: n + n = 2n, which is Θ(n).',
    },
    {
      question: 'Does O(n²) mean exactly n² operations?',
      answer: 'No. It is an asymptotic upper bound, up to constant factors for sufficiently large n.',
    },
    {
      question: 'What assumption is missing from “average-case time”?',
      answer: 'An input distribution. Expected work depends on how likely different inputs are.',
    },
  ],
  connections: [
    { title: 'Compare the growth curves', href: '#/algorithms/selection/growth' },
    { title: 'Analyze recursive work', href: '#/discrete/master-theorem/understand' },
  ],
};
