import { n, o, r } from '../../shared/study/math.ts';

export const lesson = {
  id: 'space',
  domain: 'complexity',
  slug: 'space',
  title: 'Space complexity',
  question: 'What has to be stored at the same time?',
  intro: 'Separate the input from extra storage, then count the peak live memory.',
  idea: 'Memory complexity counts what is alive simultaneously. Repeatedly reusing one buffer does not multiply its size by the number of steps.',
  anchor: r(`<mtext>total space</mtext>`, o('='), `<mtext>input</mtext>`, o('+'), `<mtext>auxiliary space</mtext>`),
  anchorLabel: 'State which definition you are using',
  flow: [
    {
      title: 'Separate',
      body: 'Input storage already exists. Auxiliary storage is the extra memory used to perform the computation.',
    },
    { title: 'Find', body: 'Count temporary arrays, held values, maps, and live recursive-call frames.' },
    {
      title: 'Peak',
      body: 'Find the largest amount alive at one moment. Do not add allocations that have already been released or reused.',
    },
  ],
  facts: [
    {
      label: 'In place',
      body: 'Insertion and selection sorts here keep only a fixed number of extra values and indices: Θ(1) auxiliary space.',
    },
    {
      label: 'Recursion',
      body: 'A recursion stack counts as auxiliary space. Count depth, not the total number of calls ever made.',
    },
    {
      label: 'Time is separate',
      body: 'Two algorithms with similar runtime can use very different amounts of working memory.',
    },
  ],
  caution:
    'Implementation choices matter: slices, copies, returned arrays, and unreused buffers can change the space bound.',
  examples: [
    {
      title: 'One held key',
      intro: 'An in-place insertion sort operates on an existing n-value array.',
      steps: [
        { title: 'Input', body: 'The array takes Θ(n) space. It is not auxiliary memory.' },
        { title: 'Extra', body: 'One key and a fixed number of indices do not grow with n.' },
      ],
      result: 'Auxiliary space is Θ(1); total space including the input is Θ(n).',
    },
    {
      title: 'One reusable merge buffer',
      intro: 'An efficient array merge sort allocates one n-cell buffer and uses recursive halves.',
      steps: [
        { title: 'Buffer', body: 'The shared buffer costs Θ(n), even when reused for many merges.' },
        { title: 'Stack', body: 'Balanced splitting has Θ(log n) simultaneous call frames.' },
        { title: 'Combine', body: 'The peak extra memory is Θ(n + log n), dominated by the buffer.' },
      ],
      result: 'Auxiliary space is Θ(n), not Θ(n log n) for this buffer-reuse implementation.',
    },
    {
      title: 'A quicksort stack',
      intro: 'Consider the standard recursive in-place partitioning version.',
      steps: [
        { title: 'Balanced partitions', body: 'The longest active call chain has Θ(log n) frames.' },
        {
          title: 'Repeatedly unbalanced partitions',
          body: 'The chain can reach Θ(n) frames. An implementation that always recurses on the smaller side can limit this stack growth.',
        },
      ],
      result: '“In-place partition” does not mean “no recursive stack.” State the implementation and the input case.',
    },
    {
      title: 'Counting buckets and output',
      intro: 'A stable counting sort has n values and a range of k bucket positions.',
      steps: [
        { title: 'Buckets', body: 'Counts need k cells.' },
        { title: 'Output', body: 'The output buffer needs n cells; holding both requires Θ(n + k) extra space.' },
      ],
      result: 'A frequency-only reconstruction may avoid a separate output array; that is a different implementation.',
    },
  ],
  checks: [
    {
      question: 'If you reuse one n-cell buffer 20 times, is auxiliary space 20n?',
      answer: 'No. The peak buffer storage is n cells. Reuse changes neither its size nor its asymptotic bound.',
    },
    {
      question: 'Does making n recursive calls always require Θ(n) stack space?',
      answer:
        'No. The stack counts simultaneous active calls. A balanced recursion tree can have n total calls but only Θ(log n) depth.',
    },
    {
      question: 'Can an algorithm have Θ(1) auxiliary space and Θ(n) total space?',
      answer: 'Yes. An in-place algorithm can use constant extra storage while the input itself occupies n cells.',
    },
  ],
  connections: [
    { title: 'See the merge buffer in context', href: '#/algorithms/merge/play' },
    { title: 'Compare time and space', href: '#/complexity/time/understand' },
  ],
};
