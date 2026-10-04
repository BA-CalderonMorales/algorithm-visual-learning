import { n, v, o, r, f, par, next, reciprocal, sigma, eq } from '../../shared/study/math.ts';

export const lesson = {
  id: 'telescoping',
  domain: 'discrete',
  slug: 'telescoping',
  title: 'Telescoping sums',
  question: 'What survives when neighbors cancel?',
  intro: 'Rewrite a term as a difference. Match opposite copies. Keep the endpoints.',
  idea: 'Each interior value occurs twice: once positive and once negative. Their sum is zero. The first positive and last negative have no partners.',
  anchor: eq(
    sigma('k', 1, 'n', par(r(v('F'), par(v('k')), o('−'), v('F'), par(next('k'))))),
    r(v('F'), par(n(1)), o('−'), v('F'), par(next('n'))),
  ),
  anchorLabel: 'The endpoint rule, for n ≥ 1',
  flow: [
    { title: 'Rewrite', body: 'Look for a difference F(k) − F(k + 1). Verify your rewrite before canceling.' },
    { title: 'Match', body: 'The negative F(k + 1) cancels the positive F(k + 1) in the following term.' },
    { title: 'Keep', body: 'Keep F(1) and −F(n + 1). If the lower bound is a, the first endpoint is F(a).' },
  ],
  facts: [
    {
      label: 'Signs matter',
      body: 'Only equal magnitudes with opposite signs cancel. Crossing out two positive terms changes the sum.',
    },
    {
      label: 'Bounds matter',
      body: 'Write the actual first and last terms. Do not memorize the endpoints without checking the limits.',
    },
  ],
  caution: 'Not every sum telescopes. A shrinking term is not enough; you need matching opposite copies.',
  examples: [
    {
      title: 'A reciprocal product',
      intro: 'Evaluate ∑ from k = 1 to n of 1/[k(k + 1)], for n ≥ 1.',
      cancellation: true,
      steps: [
        {
          title: 'Verify the difference',
          body: 'Subtract over the common denominator. The numerator is (k + 1) − k = 1.',
          math: eq(r(reciprocal(v('k')), o('−'), reciprocal(next('k'))), reciprocal(r(v('k'), par(next('k'))))),
        },
        {
          title: 'Expand and cancel',
          body: 'Below, each matching color identifies one opposite pair. The green values are the endpoints.',
        },
        {
          title: 'Generalize',
          body: 'For n terms, the final negative term is −1/(n + 1).',
          math: eq(r(n(1), o('−'), reciprocal(next('n'))), f(v('n'), next('n'))),
        },
      ],
      result: 'For four terms, the sum is 1 − 1/5 = 4/5. In general it is n/(n + 1).',
    },
    {
      title: 'Change the lower bound',
      intro: 'Evaluate ∑ from k = 3 to 6 of (1/k − 1/(k + 1)).',
      steps: [
        {
          title: 'First term',
          body: 'At k = 3, write 1/3 − 1/4.',
          math: r(reciprocal(n(3)), o('−'), reciprocal(n(4))),
        },
        { title: 'Last term', body: 'At k = 6, write 1/6 − 1/7.', math: r(reciprocal(n(6)), o('−'), reciprocal(n(7))) },
        {
          title: 'Cancel the interior',
          body: 'The copies of 1/4, 1/5, and 1/6 cancel. Keep the actual endpoints.',
          math: eq(r(reciprocal(n(3)), o('−'), reciprocal(n(7))), f(n(4), n(21))),
        },
      ],
      result: 'The result is 4/21, not 1 − 1/7. The lower bound changes the first endpoint.',
    },
    {
      title: 'When it does not telescope',
      intro: 'Consider 1 + 1/2 + 1/3 + ··· + 1/n.',
      steps: [
        {
          title: 'Inspect the signs',
          body: 'Every displayed term is positive. There is no next negative copy to cancel.',
        },
        {
          title: 'Choose a different tool',
          body: 'This harmonic sum grows as Θ(log n). An integral bound is one way to establish that growth.',
        },
      ],
      result: 'Do not use the endpoint rule unless you have established a valid difference-and-cancellation identity.',
    },
  ],
  checks: [
    { question: 'For n = 3, which endpoints survive?', answer: '1 and −1/4. The sum is 1 − 1/4 = 3/4.' },
    { question: 'Can −1/3 cancel −1/3?', answer: 'No. They have the same sign. A matching pair must add to zero.' },
    {
      question: 'What changes if the sum starts at k = a?',
      answer: 'The first surviving positive term is F(a). The final surviving negative term is still −F(n + 1).',
    },
  ],
  connections: [
    { title: 'Turn sums into operation counts', href: '#/complexity/time/examples' },
    { title: 'Prove the endpoint identity', href: '#/discrete/induction/understand' },
  ],
};
