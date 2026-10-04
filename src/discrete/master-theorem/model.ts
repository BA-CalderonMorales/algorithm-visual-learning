import { n, v, o, r, f, par } from '../../shared/study/math.ts';

export const lesson = {
  id: 'master',
  domain: 'discrete',
  slug: 'master-theorem',
  title: 'Master theorem',
  question: 'Where does a recursion tree do its work?',
  intro: 'Compare the work between recursive calls with the tree’s branching benchmark.',
  idea: 'For equal-size recursive subproblems, the work can concentrate near the leaves, balance across levels, or concentrate near the root.',
  anchor: r(v('T'), par(v('n')), o('='), v('a'), v('T'), par(f(v('n'), v('b'))), o('+'), v('f'), par(v('n'))),
  anchorLabel: 'a ≥ 1 subproblems, shrink factor b > 1, outside work f(n)',
  flow: [
    {
      title: 'Read',
      body: 'Identify a, b, and f(n). These describe the branching, the shrinking, and the non-recursive work.',
    },
    { title: 'Compare', body: 'Compute n^(log_b a). Compare f(n) with this benchmark, not with a or b alone.' },
    { title: 'Check', body: 'Apply a case only when its conditions hold. Unequal splits need a different analysis.' },
  ],
  facts: [
    { label: 'Case 1 · leaves dominate', body: 'For some ε > 0, f(n) = O(n^(log_b a − ε)). Result: Θ(n^(log_b a)).' },
    {
      label: 'Case 2 · levels balance',
      body: 'In the basic matching case, f(n) = Θ(n^(log_b a)). Result: Θ(n^(log_b a) log n).',
    },
    {
      label: 'Case 3 · root dominates',
      body: 'For some ε > 0, f(n) = Ω(n^(log_b a + ε)), and a f(n/b) ≤ c f(n) for some c < 1 at sufficiently large n. Result: Θ(f(n)).',
    },
  ],
  caution:
    '“Smaller” and “larger” in Cases 1 and 3 require a polynomial gap. For example, n/log n is smaller than n, but does not satisfy basic Case 1 with benchmark n.',
  examples: [
    {
      title: 'Merge sort · balanced levels',
      intro: 'T(n) = 2T(n/2) + n, with constant-size base cases.',
      steps: [
        { title: 'Identify', body: 'a = 2, b = 2, and f(n) = n.' },
        { title: 'Benchmark', body: 'n^(log₂ 2) = n. The outside work matches it.' },
        { title: 'Count levels', body: 'Each level contributes Θ(n) work. There are Θ(log n) levels.' },
      ],
      result: 'Basic Case 2 gives Θ(n log n).',
      resultMath: r(v('T'), par(v('n')), o('='), v('Θ'), par(r(v('n'), v('log'), v('n')))),
    },
    {
      title: 'Constant outside work · leaves',
      intro: 'T(n) = 2T(n/2) + 1, with constant-size base cases.',
      steps: [
        { title: 'Compare', body: 'The benchmark is n. Constant work is polynomially smaller.' },
        { title: 'Sum the levels', body: 'For n = 8, the level costs are 1, 2, 4, and 8. Their geometric sum is 15.' },
      ],
      result: 'Case 1 gives Θ(n). The leaf count drives the growth.',
    },
    {
      title: 'Quadratic outside work · root',
      intro: 'T(n) = 2T(n/2) + n², with constant-size base cases.',
      steps: [
        { title: 'Compare', body: 'n² is polynomially larger than benchmark n.' },
        { title: 'Check regularity', body: '2(n/2)² = n²/2. Choose c = 1/2, which is less than 1.' },
        { title: 'Sum the levels', body: 'For n = 8, the level costs are 64, 32, 16, and 8. The root dominates.' },
      ],
      result: 'Case 3 gives Θ(n²).',
    },
    {
      title: 'Know when to stop',
      intro: 'T(n) = T(n/3) + T(2n/3) + n has unequal subproblem sizes.',
      steps: [
        { title: 'Check the form', body: 'There is no single b that describes both recursive calls.' },
        {
          title: 'Choose another method',
          body: 'Use a recursion tree, substitution, or an appropriate general theorem. Do not force this into the basic Master theorem.',
        },
      ],
      result: 'A theorem is useful only when its assumptions match the recurrence.',
    },
  ],
  checks: [
    {
      question: 'In 2T(n/2) + n, is f(n) the whole running time?',
      answer: 'No. f(n) = n is the outside work at one call. T(n) includes the recursive calls as well.',
    },
    {
      question: 'Why does the matching case gain log n?',
      answer: 'There are Θ(log n) levels, each with the same asymptotic total work.',
    },
    {
      question: 'Does “bigger than the benchmark” alone establish Case 3?',
      answer: 'No. You need the polynomial-gap and regularity conditions.',
    },
  ],
  connections: [
    { title: 'See the merging work', href: '#/algorithms/merge/play' },
    { title: 'Separate work from extra memory', href: '#/complexity/space/understand' },
  ],
};
