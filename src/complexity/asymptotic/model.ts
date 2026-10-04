import { n, v, o, r, f, par } from '../../shared/study/math.ts';

export const lesson = {
  id: 'asymptotic',
  domain: 'complexity',
  slug: 'asymptotic',
  title: 'Asymptotic bounds',
  question: 'What does a growth bound actually promise?',
  intro:
    'Learn what O, o, Θ, Ω, and ω say about functions—without mixing bounds up with best, average, and worst input cases.',
  idea: 'A bound compares two functions after the input becomes large. It says how their growth relates; it does not name an input case or an exact operation count.',
  anchor: r(v('f'), o('∈'), v('O'), par(v('g')), o('⇔'), `<mtext>f(n) ≤ c · g(n) for all n ≥ n₀</mtext>`),
  anchorLabel: 'Big O: eventually, a constant multiple of g is enough to stay above f',
  flow: [
    {
      title: 'Name the functions',
      body: 'f(n) is the work or quantity you measured. g(n) is the comparison growth rate. Keep the variable and units consistent.',
    },
    {
      title: 'Ignore the small beginning',
      body: 'Asymptotic notation asks what happens for sufficiently large n. A finite prefix and constant factors do not decide the class.',
    },
    {
      title: 'Ask which relationship holds',
      body: 'Upper, lower, tight, or strict? Prove that relationship between f and g; do not infer it from the algorithm’s best or worst label.',
    },
  ],
  facts: [
    {
      label: 'O(g) · upper bound',
      body: 'There are constants c > 0 and n₀ such that 0 ≤ f(n) ≤ c·g(n) for every n ≥ n₀.',
    },
    {
      label: 'Ω(g) · lower bound',
      body: 'There are constants c > 0 and n₀ such that 0 ≤ c·g(n) ≤ f(n) for every n ≥ n₀.',
    },
    {
      label: 'Θ(g) · tight bound',
      body: 'Both O(g) and Ω(g) hold. f and g grow at the same asymptotic rate, up to constant factors.',
    },
    {
      label: 'o(g) · strict upper bound',
      body: 'f grows strictly slower than g: f(n)/g(n) → 0 as n → ∞. This is stronger than O(g).',
    },
    {
      label: 'ω(g) · strict lower bound',
      body: 'f grows strictly faster than g: f(n)/g(n) → ∞ as n → ∞. This is stronger than Ω(g).',
    },
  ],
  caution:
    '“Worst case” chooses which input’s work function to analyze; O, Ω, and Θ describe bounds on that function. Worst-case Θ(n²) is perfectly meaningful.',
  examples: [
    {
      title: 'A strict upper bound',
      intro: 'Compare f(n) = n log₂ n with g(n) = n².',
      steps: [
        {
          title: 'Form the ratio',
          body: 'Divide the actual growth by the proposed comparison: f(n)/g(n) = log₂(n)/n.',
        },
        {
          title: 'Take the limit',
          body: 'As n grows, log₂(n)/n approaches 0. The ratio does not merely stay bounded; it vanishes.',
        },
      ],
      result: 'n log n ∈ o(n²), and therefore also n log n ∈ O(n²). It is not Θ(n²).',
    },
    {
      title: 'A tight bound',
      intro: 'Compare f(n) = 3n² + 4n with g(n) = n².',
      steps: [
        { title: 'Form the ratio', body: 'f(n)/g(n) = 3 + 4/n.' },
        {
          title: 'Take the limit',
          body: 'The ratio approaches 3: a positive finite constant. So each function eventually stays within constant multiples of the other.',
        },
      ],
      result: '3n² + 4n ∈ Θ(n²). It is both O(n²) and Ω(n²), but neither o(n²) nor ω(n²).',
    },
    {
      title: 'A strict lower bound',
      intro: 'Compare f(n) = n² with g(n) = n.',
      steps: [
        { title: 'Form the ratio', body: 'f(n)/g(n) = n.' },
        {
          title: 'Take the limit',
          body: 'The ratio grows without limit. f eventually outruns every constant multiple of g.',
        },
      ],
      result: 'n² ∈ ω(n), and therefore also n² ∈ Ω(n). It is not O(n).',
    },
    {
      title: 'The same algorithm, different questions',
      intro: 'Suppose an algorithm has best-case work Θ(n) and worst-case work Θ(n²).',
      steps: [
        {
          title: 'Choose a case',
          body: 'Best and worst select different input families, producing different work functions.',
        },
        {
          title: 'Bound each function',
          body: 'You can then state a tight Θ bound, an upper O bound, or another valid relationship for either function.',
        },
      ],
      result: '“Worst case” and “Θ” are not competing labels: one picks the function; the other describes its growth.',
    },
  ],
  checks: [
    {
      question: 'If f(n) ∈ O(n²), must f(n) ∈ Θ(n²)?',
      answer:
        'No. O gives only an eventual upper bound. n log n is O(n²), but it is not Θ(n²); its ratio to n² tends to zero.',
    },
    {
      question: 'What extra fact makes an upper bound tight?',
      answer: 'A matching lower bound: f ∈ O(g) and f ∈ Ω(g), together giving f ∈ Θ(g).',
    },
    {
      question: 'Is O notation synonymous with worst case?',
      answer:
        'No. First choose the input case and define its work function. Then describe that function with an upper, lower, tight, or strict bound.',
    },
    {
      question: 'What limit distinguishes little-o from Big O?',
      answer:
        'For nonnegative comparison functions, f ∈ o(g) when f(n)/g(n) tends to 0. Big O needs only that this ratio eventually stays bounded.',
    },
  ],
  comparisons: [
    {
      id: 'strict-upper',
      title: 'Strict upper · o(g)',
      fLabel: 'n log₂ n',
      gLabel: 'n²',
      f: (n) => n * Math.log2(n),
      g: (n) => n * n,
      conclusion: 'The ratio approaches 0: f is little-o of g, and also Big O of g.',
    },
    {
      id: 'tight',
      title: 'Tight · Θ(g)',
      fLabel: '3n² + 4n',
      gLabel: 'n²',
      f: (n) => 3 * n * n + 4 * n,
      g: (n) => n * n,
      conclusion: 'The ratio approaches 3: f and g bound each other within constants, so f is Θ(g).',
    },
    {
      id: 'strict-lower',
      title: 'Strict lower · ω(g)',
      fLabel: 'n²',
      gLabel: 'n',
      f: (n) => n * n,
      g: (n) => n,
      conclusion: 'The ratio grows without bound: f is little-omega of g, and also Ω(g).',
    },
  ],
  connections: [
    { title: 'Apply bounds to algorithm cases', href: '#/complexity/time/understand' },
    { title: 'See growth curves for sorting', href: '#/algorithms/sorting' },
  ],
};
