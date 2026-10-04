import { item, row, frame, text, film } from '../../shared/playback/model.ts';

function spaceFilm() {
  const values = [4, 1, 3, 2].map(item);
  const base = row(values, {}, {}, 0.25);
  return [
    frame(
      'Input',
      'Separate the input from extra memory',
      'These four input cells already exist. Auxiliary space counts only the extra storage an algorithm needs while it works.',
      base,
      { texts: [text('input', 'input array: n cells', 0.5, 0.47, 'neutral', 0.8)] },
    ),
    frame(
      'Key',
      'Insertion sort holds one key',
      'One held key and a fixed number of indices are enough. This extra storage stays constant as the input grows: Θ(1).',
      [...base, { id: 'key', value: '1', x: 0.5, y: 0.72, role: 'key' }],
      { texts: [text('extra', 'one key + a few indices', 0.5, 0.94, 'key', 0.75)] },
    ),
    frame(
      'Buffer',
      'Merge sort uses a growing buffer',
      'An efficient array merge uses a buffer proportional to the input length. A larger input needs a larger buffer: Θ(n) auxiliary space.',
      [...base, ...values.map((v, i) => ({ ...v, id: `buffer${i}`, x: (i + 0.5) / 4, y: 0.72, role: 'group' }))],
      { texts: [text('extra', 'temporary buffer: n cells', 0.5, 0.94, 'group', 0.75)] },
    ),
    frame(
      'Peak',
      'Count what is alive at the same time',
      'Reusing one buffer for successive merges uses n extra cells, not a new permanent buffer per step. Count peak live storage.',
      [...base, ...values.map((v, i) => ({ ...v, id: `buffer${i}`, x: (i + 0.5) / 4, y: 0.72, role: 'sorted' }))],
      { texts: [text('extra', 'reused buffer: still Θ(n)', 0.5, 0.94, 'sorted', 0.75)] },
    ),
  ];
}

function stackFilm(unbalanced = false) {
  const sizes = unbalanced ? [5, 4, 3, 2, 1] : [8, 4, 2, 1];
  const frames = sizes.map((size, depth) =>
    frame(
      'Call',
      `Depth ${depth + 1}: input size ${size}`,
      unbalanced
        ? `This call reduces the size by only one. The earlier calls remain active while it works, so ${depth + 1} frames are live.`
        : `Each recursive child halves the input. Its ancestors remain active, so ${depth + 1} frames are live on this one chain. Siblings are not all on the stack at once.`,
      sizes.slice(0, depth + 1).map((value, i) => ({
        id: `call${i}`,
        value: String(value),
        x: 0.5,
        y: 0.12 + i * 0.145,
        role: i === depth ? 'key' : 'group',
        small: true,
      })),
      { texts: [text('label', 'one active call chain', 0.5, 0.95, 'neutral', 0.75)] },
    ),
  );
  frames.push(
    frame(
      'Return',
      'Returning releases the frames',
      'As each call returns, its stack frame can be released. Space is the deepest active chain, not all calls added together.',
      [{ id: 'call0', value: String(sizes[0]), x: 0.5, y: 0.12, role: 'sorted' }],
      {
        texts: [
          text(
            'result',
            unbalanced ? 'one-at-a-time shrinking → Θ(n) depth' : 'halving the size → Θ(log n) depth',
            0.5,
            0.58,
            'sorted',
            0.85,
          ),
        ],
      },
    ),
  );
  return frames;
}

export const playFilms = {
  space: film(
    'space',
    'Count what stays alive.',
    'Input storage and auxiliary storage answer different questions.',
    spaceFilm(),
    [
      { title: 'See the single held key', href: '#/algorithms/insertion/play' },
      { title: 'See merge’s output grow', href: '#/algorithms/merge/play' },
    ],
  ),
};
export const legend = [
  ['neutral', 'Input storage'],
  ['key', 'Current key / call'],
  ['group', 'Extra storage / active frames'],
  ['sorted', 'Retained or reused storage'],
];
export const variants = [
  { id: 'space', label: 'Held key vs. reusable buffer', film: playFilms.space },
  {
    id: 'space-balanced',
    label: 'Balanced recursion · short stack',
    film: film(
      'space-balanced',
      'Watch one active call chain.',
      'A halving chain uses Θ(log n) simultaneous stack frames.',
      stackFilm(),
      playFilms.space.connections,
    ),
  },
  {
    id: 'space-unbalanced',
    label: 'Unbalanced recursion · deep stack',
    film: film(
      'space-unbalanced',
      'Watch the chain grow longer.',
      'Shrinking by one can keep Θ(n) stack frames alive.',
      stackFilm(true),
      playFilms.space.connections,
    ),
  },
];
