import { n, v, o, r, f, p, par, next, triangular, eq } from '../../shared/study/math.ts';

export const lesson = {
  id: 'induction',
  domain: 'discrete',
  slug: 'induction',
  title: 'Proof by induction',
  question: 'Why does a pattern keep working?',
  intro: 'Prove the first case. Then prove the bridge from any true case to the next.',
  idea: 'A few examples suggest a pattern. Induction proves that the pattern cannot break at the next step.',
  anchor: r(v('P'), par(n(1)), o('∧'), par(r(v('P'), par(v('k')), o('⇒'), v('P'), par(next('k'))))),
  anchorLabel: 'One starting case + a bridge for every k',
  flow: [
    { title: 'Start', body: 'State the claim P(n) and where n begins. Verify that first value directly.' },
    { title: 'Assume', body: 'For an arbitrary valid k, assume only P(k). This is the inductive hypothesis.' },
    { title: 'Bridge', body: 'Use P(k) to derive P(k + 1). Explain exactly where the hypothesis enters.' },
  ],
  facts: [
    {
      label: 'What the picture shows',
      body: 'Adding a row makes the next triangular sum. The algebra—not the picture alone—proves it for every k.',
    },
    {
      label: 'Why the chain starts',
      body: 'The base case supplies the first true statement. The bridge then carries truth through every later case.',
    },
  ],
  caution: 'Do not assume the statement at k + 1. That is the statement you still need to prove.',
  examples: [
    {
      title: 'Sum of the first n integers',
      intro: 'Claim: 1 + 2 + ··· + n = n(n + 1)/2 for every integer n ≥ 1.',
      steps: [
        { title: 'Base case', body: 'At n = 1, both sides are 1.', math: eq(n(1), f(r(n(1), o('×'), n(2)), n(2))) },
        {
          title: 'Hypothesis',
          body: 'Assume the formula at an arbitrary k ≥ 1.',
          math: eq(r(n(1), o('+'), o('⋯'), o('+'), v('k')), triangular('k')),
        },
        {
          title: 'Use the hypothesis',
          body: 'Separate the new last term; replace the old sum using the assumption.',
          math: r(triangular('k'), o('+'), par(next('k'))),
        },
        {
          title: 'Combine and factor',
          body: 'Give the added term denominator 2, then factor out k + 1.',
          math: eq(
            f(r(v('k'), par(next('k')), o('+'), n(2), par(next('k'))), n(2)),
            f(r(par(next('k')), par(r(v('k'), o('+'), n(2)))), n(2)),
          ),
        },
      ],
      result: 'This is exactly the claim at k + 1. The base case and bridge prove it for all n ≥ 1.',
    },
    {
      title: 'Powers of two',
      intro: 'Claim: 2ⁿ ≥ n + 1 for every integer n ≥ 0.',
      steps: [
        { title: 'Base case', body: 'At n = 0, 2⁰ = 1 and n + 1 = 1.' },
        { title: 'Hypothesis', body: 'Assume 2ᵏ ≥ k + 1 for an arbitrary k ≥ 0.' },
        {
          title: 'Bridge',
          body: 'Multiply the hypothesis by 2. Since k ≥ 0, 2(k + 1) ≥ k + 2.',
          math: r(p(n(2), next('k')), o('≥'), n(2), par(next('k')), o('≥'), v('k'), o('+'), n(2)),
        },
      ],
      result: 'The next power is at least the next required bound. The claim holds for all n ≥ 0.',
    },
    {
      title: 'An algorithm invariant',
      intro: 'Insertion sort grows a sorted prefix. This uses the same base-and-bridge structure.',
      steps: [
        { title: 'Base', body: 'A prefix containing one value is sorted.' },
        { title: 'Assume', body: 'Before the next insertion, assume the first k values are sorted.' },
        {
          title: 'Preserve',
          body: 'Move larger prefix values right, then insert the key after the last value no greater than it.',
        },
      ],
      result:
        'The first k + 1 values are sorted. Repeating the bridge until the prefix covers the input proves the final array is sorted.',
    },
  ],
  checks: [
    {
      question: 'Where does the hypothesis enter the sum proof?',
      answer: 'Replace 1 + 2 + ··· + k with k(k + 1)/2. Then handle the new term k + 1.',
    },
    {
      question: 'Would checking n = 1, 2, and 3 prove the formula?',
      answer: 'No. Those checks establish only three cases. The arbitrary-k bridge covers every later case.',
    },
    {
      question: 'Why is assuming P(k + 1) a mistake?',
      answer: 'It assumes the result you are trying to establish, making the proof circular.',
    },
  ],
  connections: [
    { title: 'See the sorted-prefix bridge', href: '#/algorithms/insertion/play' },
    { title: 'Use the sum to count comparisons', href: '#/complexity/time/examples' },
  ],
};
