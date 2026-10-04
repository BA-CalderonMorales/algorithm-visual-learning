import { item, row, frame, text, film } from '../../shared/playback/model.ts';

function inductionFilm() {
  const dots = (n) =>
    Array.from({ length: n }, (_, r) =>
      Array.from({ length: r + 1 }, (_, c) => ({
        id: `d${r}-${c}`,
        value: '',
        x: 0.27 + c * 0.095,
        y: 0.24 + r * 0.13,
        role: 'sorted',
        small: true,
      })),
    ).flat();
  const equation = (value, role = 'neutral') => [text('equation', value, 0.5, 0.84, role, 0.9)];
  return [
    frame(
      'Base',
      'Check the first case',
      'For n = 1, the sum is 1 and the formula gives 1 × 2 / 2 = 1. This is the base case.',
      dots(1),
      { texts: equation('1 = 1 × 2 / 2') },
    ),
    frame(
      'Assume',
      'Assume the sum through k',
      'Suppose the first k rows contain k(k + 1)/2 dots. This assumption will help prove the very next row.',
      dots(3),
      { texts: equation('1 + 2 + ··· + k = k(k + 1)/2', 'sorted') },
    ),
    frame(
      'Bridge',
      'Add exactly one new row',
      'To reach k + 1, keep the assumed sum and add a row of k + 1 dots. Here k = 3, so the new row has 4 dots.',
      dots(4).map((t) => ({ ...t, role: t.id.startsWith('d3') ? 'key' : 'sorted' })),
      { texts: equation('k(k + 1)/2 + (k + 1)', 'key') },
    ),
    frame(
      'Bridge',
      'Put both terms over 2',
      'Rewrite the added row as 2(k + 1)/2. This gives a common denominator so the numerators can be added.',
      dots(4),
      { texts: equation('[k(k + 1) + 2(k + 1)] / 2', 'group') },
    ),
    frame(
      'Bridge',
      'Factor the shared term',
      'Both numerator terms contain k + 1. Factoring gives (k + 1)(k + 2)/2, the formula for the next case.',
      dots(4),
      { texts: equation('(k + 1)(k + 2) / 2', 'sorted') },
    ),
    frame(
      'Conclusion',
      'The same bridge works for every k',
      'The diagram illustrates the bridge at k = 3. The algebra proves P(k) implies P(k + 1) for every positive k; the base case starts the chain.',
      dots(4),
      { texts: equation('base case + P(k) ⇒ P(k + 1)', 'sorted') },
    ),
  ];
}

function powersFilm() {
  const frames = Array.from({ length: 5 }, (_, exponent) =>
    frame(
      exponent === 0 ? 'Base' : 'Examples',
      exponent === 0 ? 'Start where both sides are 1' : `At n = ${exponent}, compare both sides`,
      `2 to the power ${exponent} is ${2 ** exponent}. The bound n + 1 is ${exponent + 1}. These examples illustrate the claim; the next scene gives the general bridge.`,
      [
        { id: 'power', value: String(2 ** exponent), x: 0.3, y: 0.42, role: 'key' },
        { id: 'bound', value: String(exponent + 1), x: 0.7, y: 0.42, role: 'sorted' },
      ],
      {
        texts: [
          text('power-label', '2ⁿ', 0.3, 0.16, 'key'),
          text('bound-label', 'n + 1', 0.7, 0.16, 'sorted'),
          text('comparison', '≥', 0.5, 0.42, 'neutral', 1.4),
        ],
      },
    ),
  );
  frames.push(
    frame(
      'Bridge',
      'Prove the arbitrary next case',
      'Assume 2ᵏ ≥ k + 1 for k ≥ 0. Multiply by 2: 2ᵏ⁺¹ ≥ 2(k + 1) ≥ k + 2. With the base case, this proves the claim for all n ≥ 0.',
      [],
      {
        texts: [
          text('hypothesis', '2ᵏ ≥ k + 1', 0.5, 0.22, 'key'),
          text('bridge', '2ᵏ⁺¹ ≥ 2(k + 1) ≥ k + 2', 0.5, 0.56, 'sorted', 0.85),
        ],
      },
    ),
  );
  return frames;
}

function prefixProofFilm() {
  const values = [4, 7, 8, 2].map(item);
  let ordered = [...values];
  const frames = [
    frame(
      'Base',
      'One value is already sorted',
      'The first value forms a sorted prefix. This is the base case for the loop invariant.',
      row(ordered, { 0: 'sorted' }),
    ),
  ];
  frames.push(
    frame(
      'Assume',
      'Assume a sorted prefix of size k',
      'Here k = 3: 4, 7, and 8 are sorted. The next key is 2. Assume the old prefix is sorted; do not assume the enlarged one is.',
      row(ordered, { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'key' }),
    ),
  );
  for (let slot = 3; slot > 0; slot--) {
    [ordered[slot], ordered[slot - 1]] = [ordered[slot - 1], ordered[slot]];
    frames.push(
      frame(
        'Preserve',
        `Move ${ordered[slot].value} right`,
        `The prefix value ${ordered[slot].value} exceeds key 2, so it shifts right. The key is drawn in the open slot to make its destination clear.`,
        row(
          ordered,
          Object.fromEntries(
            ordered.map((value, index) => [index, index === slot - 1 ? 'key' : index === slot ? 'shift' : 'sorted']),
          ),
        ),
      ),
    );
  }
  frames.push(
    frame(
      'Conclude',
      'The prefix grows by one',
      'Insert 2 at the front. The first k + 1 values are now sorted. The same preservation step works for every iteration, until the prefix is the entire input.',
      row(ordered, { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'sorted' }),
    ),
  );
  return frames;
}

export const playFilms = {
  induction: film(
    'induction',
    'See the bridge to the next case.',
    'Use the assumption at k to prove the next case, then let the base case start the chain.',
    inductionFilm(),
    [
      { title: 'Use this idea on a sorted prefix', href: '#/algorithms/insertion/understand' },
      { title: 'Follow the complete proof', href: '#/discrete/induction' },
    ],
  ),
};
export const legend = [
  ['sorted', 'Assumed / established'],
  ['key', 'New case or term'],
  ['group', 'Algebraic bridge'],
];
export const variants = [
  { id: 'induction', label: 'Sum · add the next row', film: playFilms.induction },
  {
    id: 'induction-powers',
    label: 'Inequality · powers of two',
    film: film(
      'induction-powers',
      'Grow both sides of an inequality.',
      'The bridge proves every case; checking examples alone does not.',
      powersFilm(),
      playFilms.induction.connections,
    ),
  },
  {
    id: 'induction-prefix',
    label: 'Invariant · a sorted prefix',
    film: film(
      'induction-prefix',
      'Preserve a sorted prefix.',
      'An algorithm invariant uses the same base-and-bridge structure.',
      prefixProofFilm(),
      playFilms.induction.connections,
      'The key is shown in the open slot; the implementation holds it separately.',
    ),
  },
];
