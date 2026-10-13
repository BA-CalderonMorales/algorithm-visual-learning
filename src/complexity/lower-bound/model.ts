import { n, v, o, r, p } from '../../shared/study/math.ts';
export const lesson = {
  id: 'lower-bound',
  domain: 'complexity',
  slug: 'sorting-lower-bound',
  title: 'Sorting and Decision Trees',
  question: 'How many questions must distinguish every possible ordering?',
  intro: 'A comparison eliminates possible orders. A decision tree records all questions and outcomes.',
  idea: 'For n distinct items, a correct comparison sort must distinguish n! possible orders. A binary tree needs enough depth to reach that many different leaves.',
  anchor: r(p(n(2), v('d')), o('≥'), v('n'), o('!')),
  anchorLabel: 'At most 2ᵈ leaves after d binary decisions; at least n! orders to distinguish.',
  flow: [
    {
      title: 'Interpret the tree',
      body: 'An internal node asks a comparison. An edge is an outcome. A root-to-leaf path is one execution. Its depth counts comparisons.',
    },
    {
      title: 'Count possible orders',
      body: 'Three distinct labeled items have six orderings. In general n items have n! permutations. Correct outputs must distinguish them.',
    },
    {
      title: 'Bound the depth',
      body: 'A binary decision tree of depth d has at most 2ᵈ leaves, so the deepest path requires at least ceil(log₂(n!)) comparisons. This is Ω(n log n) asymptotically.',
    },
    {
      title: 'State the model',
      body: 'This bound applies to algorithms learning order only through comparisons. Counting sort uses integer values as array indices and has additional range assumptions.',
    },
  ],
  facts: [
    {
      label: 'Worst versus average',
      body: 'Worst case is the deepest leaf. Expected comparisons weight each leaf depth by its input probability; a plain mean assumes equal probabilities.',
    },
    {
      label: 'Counting sort',
      body: 'For n items in a range of k integers, counting sort takes O(n+k) time. It is linear in n when k=O(n); a huge sparse value range can be costly.',
    },
  ],
  caution:
    'An asymptotic bound is not an exact operation count. ceil(log₂(n!)) is an information lower bound; it alone does not prove an algorithm achieving it for every n.',
  examples: [
    {
      title: 'Four items need at least five comparisons in the worst case',
      intro: 'There are 4! = 24 possible orders.',
      steps: [
        { title: 'Four levels are insufficient', body: '2⁴ = 16 leaves cannot distinguish 24 outputs.' },
        {
          title: 'Five levels have enough leaf capacity',
          body: '2⁵ = 32. Therefore every correct comparison sort has a path of depth at least 5.',
        },
        {
          title: 'Interpret the conclusion',
          body: 'This proves a necessary lower bound, not the cost of every input or every algorithm.',
        },
      ],
      result: 'Worst-case comparisons are at least ceil(log₂24) = 5.',
    },
  ],
  checks: [
    {
      question: 'Does Ω(n log n) mean exactly n log₂ n comparisons?',
      answer: 'No. It describes eventual growth up to a constant factor, not an exact finite count.',
    },
    {
      question: 'Why can counting sort avoid this lower bound?',
      answer:
        'It uses integer-indexed counting with a bounded value range, rather than deriving order only through comparisons.',
    },
    {
      question: 'Is the average depth always an unweighted mean?',
      answer: 'Only for equally likely input orderings. Otherwise weight paths by their probabilities.',
    },
  ],
};
