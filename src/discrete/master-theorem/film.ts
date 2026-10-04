import { frame, text, film } from '../../shared/playback/model.ts';

function masterFilm(power = 1) {
  const labels = power === 0 ? ['1', '2', '4', '8'] : power === 1 ? ['8', '8', '8', '8'] : ['64', '32', '16', '8'];
  const tokens = [],
    links = [],
    frames = [];
  for (let level = 0; level < 4; level++) {
    for (let i = 0; i < 2 ** level; i++) {
      const id = `tree${level}-${i}`;
      tokens.push({
        id,
        value: String(8 / 2 ** level),
        x: (i + 0.5) / 2 ** level,
        y: 0.14 + level * 0.19,
        role: 'key',
        cellSize: 40,
        small: level === 3,
      });
      if (level) links.push({ from: `tree${level - 1}-${Math.floor(i / 2)}`, to: id, role: 'neutral' });
    }
    frames.push(
      frame(
        'Levels',
        level === 0 ? 'Read the recurrence' : `Level ${level}: ${2 ** level} subproblems`,
        level === 0
          ? `T(n) = 2T(n/2) + ${power === 0 ? '1' : power === 1 ? 'n' : 'n²'}. Each node labels its input size; the outside work is counted separately.`
          : `${2 ** level} nodes each handle size ${8 / 2 ** level}. Their combined outside work is ${labels[level]} for this n = 8 example.`,
        structuredClone(tokens),
        {
          links: structuredClone(links),
          texts: labels
            .slice(0, level + 1)
            .map((v, i) => text(`cost${i}`, `work ${v}`, 1.08, 0.14 + i * 0.19, 'shift', 0.6)),
          diagramWidth: 0.8,
        },
      ),
    );
  }
  const result = power === 0 ? 'Θ(n)' : power === 1 ? 'Θ(n log n)' : 'Θ(n²)';
  frames.push(
    frame(
      'Total',
      power === 0 ? 'The leaves dominate' : power === 1 ? 'Equal work at each level' : 'The root dominates',
      power === 0
        ? 'Work doubles by level: 1 + 2 + 4 + 8. In general the geometric sum is Θ(n), the basic Master theorem case 1.'
        : power === 1
          ? 'Every level does n work and there are log₂ n + 1 levels. Total work is Θ(n log n), the basic Master theorem case 2.'
          : 'Work halves by level: 64 + 32 + 16 + 8. The geometric sum is Θ(n²), the basic Master theorem case 3.',
      tokens.map((t) => ({ ...t, role: 'sorted' })),
      { links, texts: [text('total', result, 0.5, 0.94, 'sorted', 1.1)] },
    ),
  );
  return frames;
}

export const playFilms = {
  master: film(
    'master',
    'Count the work across a tree.',
    'Count the work at each level, then add the levels.',
    masterFilm(),
    [
      { title: 'Watch the actual merges', href: '#/algorithms/merge/play' },
      { title: 'Connect the tree to growth', href: '#/algorithms/merge/growth' },
    ],
  ),
};
export const legend = [
  ['key', 'Subproblem input size'],
  ['shift', 'Work at this level'],
  ['sorted', 'Total growth'],
];
export const masterVariants = [
  { id: 'master', label: 'Equal levels: + n', film: playFilms.master },
  {
    id: 'master-leaves',
    label: 'Leaves dominate: + 1',
    film: film(
      'master-leaves',
      'The leaves dominate.',
      'The work doubles at successive levels.',
      masterFilm(0),
      playFilms.master.connections,
    ),
  },
  {
    id: 'master-root',
    label: 'Root dominates: + n²',
    film: film(
      'master-root',
      'The root dominates.',
      'The work halves at successive levels.',
      masterFilm(2),
      playFilms.master.connections,
    ),
  },
];
export const variants = masterVariants;
