import { frame, text, film } from '../../shared/playback/model.ts';

function timeFilm() {
  const dots = [];
  const frames = [
    frame(
      'Count',
      'Count one comparison',
      'Selection sort checks every value after the boundary. For n = 5, the first pass makes four comparisons.',
      [],
      { texts: [text('rule', 'count the comparisons, not the seconds', 0.5, 0.44, 'key', 0.85)] },
    ),
  ];
  for (let pass = 0; pass < 4; pass++) {
    for (let c = 0; c < 4 - pass; c++)
      dots.push({
        id: `check${pass}-${c}`,
        value: '',
        x: 0.28 + c * 0.13,
        y: 0.22 + pass * 0.16,
        role: 'compare',
        small: true,
      });
    frames.push(
      frame(
        'Sum',
        `Pass ${pass + 1} adds ${4 - pass} comparisons`,
        `The boundary advances, so one fewer value remains to check. So far: ${[4, 3, 2, 1].slice(0, pass + 1).join(' + ')} comparisons.`,
        structuredClone(dots),
        {
          texts: [
            text(
              'total',
              `${[4, 3, 2, 1].slice(0, pass + 1).reduce((a, b) => a + b, 0)} comparisons`,
              0.5,
              0.94,
              'compare',
              0.8,
            ),
          ],
        },
      ),
    );
  }
  frames.push(
    frame(
      'Growth',
      'The triangle grows quadratically',
      'In general, (n − 1) + ··· + 1 = n(n − 1)/2. The dominant term is n², so selection makes Θ(n²) comparisons.',
      dots,
      { texts: [text('formula', 'n(n − 1)/2 = ½n² − ½n', 0.5, 0.94, 'group', 0.85)] },
    ),
  );
  frames.push(
    frame(
      'Cases',
      'Input cases and bounds answer different questions',
      'Selection still scans sorted input. Best, average, and worst cases all have Θ(n²) comparisons. O, Ω, and Θ describe bounds on growth.',
      dots.map((t) => ({ ...t, role: 'sorted' })),
      { texts: [text('cases', 'best = average = worst: Θ(n²)', 0.5, 0.94, 'sorted', 0.85)] },
    ),
  );
  return frames;
}

function halvingFilm() {
  const frames = [16, 8, 4, 2, 1].map((size, count) =>
    frame(
      'Halve',
      count === 0 ? 'Start with size n' : `Halving ${count}: size ${size}`,
      count === 0
        ? 'For this example, n = 16. Repeatedly divide the current size by 2 until it reaches 1.'
        : `One more constant-cost division halves the remaining size. After ${count} divisions, it is ${size}.`,
      [{ id: 'size', value: String(size), x: 0.5, y: 0.38, role: 'key' }],
      { texts: [text('count', `${count} divisions so far`, 0.5, 0.75, 'compare', 0.85)] },
    ),
  );
  frames.push(
    frame(
      'Growth',
      'Doubling the input adds one halving',
      'n = 16 needs 4 halvings; n = 32 needs 5. After t halvings the size is about n/2ᵗ, so reaching 1 takes Θ(log n) steps.',
      [],
      { texts: [text('rule', 'n / 2ᵗ ≈ 1', 0.5, 0.25, 'key'), text('result', 't ≈ log₂ n', 0.5, 0.6, 'sorted', 1.2)] },
    ),
  );
  return frames;
}

function consecutiveFilm() {
  const cells = Array.from({ length: 8 }, (_, i) => ({
    id: `loop${i}`,
    value: '',
    x: 0.25 + (i % 4) * 0.16,
    y: i < 4 ? 0.3 : 0.65,
    role: 'neutral',
  }));
  const labels = [
    text('first', 'first loop', 0.5, 0.05, 'key', 0.75),
    text('second', 'second loop', 0.5, 0.91, 'group', 0.75),
  ];
  return [
    frame(
      'First',
      'A loop visits n values',
      'For n = 4, the first loop performs four constant-cost actions.',
      cells.map((t, i) => ({ ...t, role: i < 4 ? 'key' : 'neutral' })),
      { texts: labels },
    ),
    frame(
      'Second',
      'Then another loop visits n values',
      'The second loop runs after the first, not inside it. It adds four actions; it does not repeat four times for every earlier action.',
      cells.map((t, i) => ({ ...t, role: i < 4 ? 'key' : 'group' })),
      { texts: labels },
    ),
    frame(
      'Total',
      'Add phases; do not multiply them',
      'At n = 4, the total is 4 + 4 = 8. In general, n + n = 2n, so consecutive linear loops have Θ(n) total work.',
      cells.map((t) => ({ ...t, role: 'sorted' })),
      { texts: [text('total', 'n + n = 2n → Θ(n)', 0.5, 0.93, 'sorted', 0.8)] },
    ),
  ];
}

export const playFilms = {
  time: film(
    'time',
    'Turn the scans into a sum.',
    'Selection’s shrinking scans make a triangle of comparisons.',
    timeFilm(),
    [
      { title: 'Watch selection’s scan', href: '#/algorithms/selection/play' },
      { title: 'Change the input size', href: '#/algorithms/selection/growth' },
    ],
  ),
};
export const legend = [
  ['key', 'Input / first phase'],
  ['compare', 'Counted operation'],
  ['group', 'Second phase / formula'],
  ['sorted', 'Total growth'],
];
export const variants = [
  { id: 'time', label: 'Shrinking scans · quadratic', film: playFilms.time },
  {
    id: 'time-halving',
    label: 'Halving loop · logarithmic',
    film: film(
      'time-halving',
      'Count the halvings.',
      'Doubling n adds one iteration instead of doubling the work.',
      halvingFilm(),
      playFilms.time.connections,
    ),
  },
  {
    id: 'time-consecutive',
    label: 'Consecutive loops · linear',
    film: film(
      'time-consecutive',
      'Add the work of phases.',
      'Two consecutive linear loops stay linear.',
      consecutiveFilm(),
      playFilms.time.connections,
    ),
  },
];
