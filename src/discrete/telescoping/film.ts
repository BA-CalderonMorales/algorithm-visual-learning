import { row, frame, text, film } from '../../shared/playback/model.ts';

function telescopingFilm(lower = 1, symbolic = false) {
  const fractions = Array.from({ length: 5 }, (_, i) =>
    symbolic ? `F(${i + 1})` : lower + i === 1 ? '1' : `1/${lower + i}`,
  );
  const terms = Array.from({ length: 4 }, (_, i) => [
    {
      id: `plus${i}`,
      value: `+${fractions[i]}`,
      fraction: symbolic ? undefined : { sign: '+', denominator: lower + i },
      x: 0.3,
      y: 0.1 + i * 0.24,
      cellSize: 50,
      role: i === 0 ? 'sorted' : 'key',
    },
    {
      id: `minus${i}`,
      value: `−${fractions[i + 1]}`,
      fraction: symbolic ? undefined : { sign: '−', denominator: lower + i + 1 },
      x: 0.7,
      y: 0.1 + i * 0.24,
      cellSize: 50,
      role: i === 3 ? 'sorted' : 'shift',
    },
  ]).flat();
  const frames = [
    frame(
      'Rewrite',
      symbolic ? 'Write consecutive differences' : 'Turn a product into a difference',
      symbolic
        ? 'Write F(1) − F(2), then F(2) − F(3), and continue. Each negative value has a positive partner in the next row.'
        : `1/[k(k + 1)] = 1/k − 1/(k + 1). These four rows use k = ${lower} through ${lower + 3}. Each row is one term of the sum.`,
      terms,
    ),
  ];
  const removed = new Set();
  for (let i = 0; i < 3; i++) {
    removed.add(`minus${i}`);
    removed.add(`plus${i + 1}`);
    frames.push(
      frame(
        'Cancel',
        `${fractions[i + 1]} cancels its opposite`,
        `The negative ${fractions[i + 1]} in one row and positive ${fractions[i + 1]} in the next add to zero. Both signs matter.`,
        terms.map((t) => ({
          ...t,
          opacity: removed.has(t.id) ? 0.4 : 1,
          cancelled: removed.has(t.id),
          role: t.id === `minus${i}` || t.id === `plus${i + 1}` ? 'group' : t.role,
        })),
        { links: [{ from: `minus${i}`, to: `plus${i + 1}`, role: 'group', curved: true }] },
      ),
    );
  }
  frames.push(
    frame(
      'Endpoints',
      'Only the endpoints survive',
      symbolic
        ? 'Keep the first positive F(1) and last negative F(5). For bounds a through b, the general result is F(a) − F(b + 1).'
        : lower === 1
          ? 'For four terms, keep 1 − 1/5 = 4/5. For n terms starting at 1, the same cancellation leaves 1 − 1/(n + 1).'
          : `The sum starts at k = ${lower}, so keep 1/${lower} − 1/${lower + 4}. For k = 3 through 6, that is 4/21. The lower bound changes the first endpoint.`,
      terms.filter((t) => t.id === 'plus0' || t.id === 'minus3').map((t) => ({ ...t, y: 0.38 })),
      {
        texts: [
          text(
            'general',
            symbolic ? 'F(a) − F(b + 1)' : lower === 1 ? '1 − 1/(n + 1) = n/(n + 1)' : '1/3 − 1/7 = 4/21',
            0.5,
            0.78,
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
  telescoping: film(
    'telescoping',
    'Watch the middle disappear.',
    'Opposite copies cancel in pairs. The endpoints determine the sum.',
    telescopingFilm(),
    [
      { title: 'Connect sums to operation counts', href: '#/complexity/time' },
      { title: 'Explore the general identity', href: '#/discrete/telescoping' },
    ],
  ),
};
export const legend = [
  ['key', 'Positive term'],
  ['shift', 'Negative term'],
  ['group', 'Matching opposite pair'],
  ['sorted', 'Surviving endpoint'],
];
export const variants = [
  { id: 'telescoping', label: 'Start at 1 · four terms', film: playFilms.telescoping },
  {
    id: 'telescoping-offset',
    label: 'Start at 3 · different endpoints',
    film: film(
      'telescoping-offset',
      'Change the starting point.',
      'The lower bound changes the first surviving positive term.',
      telescopingFilm(3),
      playFilms.telescoping.connections,
    ),
  },
  {
    id: 'telescoping-pattern',
    label: 'General pattern · F(k)',
    film: film(
      'telescoping-pattern',
      'See the cancellation structure.',
      'The same matching rule works for any valid sequence of differences.',
      telescopingFilm(1, true),
      playFilms.telescoping.connections,
    ),
  },
];
