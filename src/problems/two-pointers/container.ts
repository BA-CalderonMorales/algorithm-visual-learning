import { scene, pointerFilm, type PointerState } from './story.ts';

export function containerFilm(values: number[], id = 'problem-container') {
  let i = 0,
    j = values.length - 1,
    best = 0;
  let bestPair: number[] = [];
  const state = (phase: PointerState['phase'], extra = {}): PointerState => ({
    kind: 'water',
    values,
    i,
    j,
    best,
    bestPair: [...bestPair],
    phase,
    ...extra,
  });
  const frames = [
    scene(
      'Set up',
      'Start with the widest pair of walls.',
      'The blue rectangle reaches only the shorter wall. Keep the heights in their original order: the gaps between positions matter.',
      state('setup'),
    ),
  ];
  while (i < j) {
    const width = j - i,
      height = Math.min(values[i], values[j]),
      area = width * height;
    const improved = area > best;
    if (improved || bestPair.length === 0) {
      best = area;
      bestPair = [i, j];
    }
    frames.push(
      scene(
        'Measure',
        improved ? 'A new best area.' : 'Keep the best area we already found.',
        improved
          ? `Save ${area} as the best area so far. The shorter wall caps the water level; the taller wall cannot lift it.`
          : `This area does not beat ${best}. Keep the record. A safe pointer move does not promise that every next container gets better.`,
        state('check'),
      ),
    );
    const equal = values[i] === values[j];
    const move = values[i] <= values[j] ? 'i' : 'j';
    const retired = move === 'i' ? i++ : j--;
    frames.push(
      scene(
        'Discard',
        equal ? `Equal walls: retire either. We move ${move}.` : `Retire the shorter wall at ${retired}.`,
        `${equal ? 'Both walls cap the same height. ' : ''}Any narrower pair keeping height ${values[retired]} has area at most ${area}. ${i < j ? `Move ${move} inward and measure again.` : 'The scan is complete.'}`,
        state('move', { move }),
      ),
    );
  }
  frames.push(
    scene(
      'Remember',
      `Best area: ${best}`,
      `Walls ${bestPair.join(' and ')} give the best rectangle. We checked ${Math.max(0, values.length - 1)} pairs, not every possible wall combination.`,
      state('done'),
    ),
  );
  return pointerFilm(id, 'Retire the limiting wall', frames, '#/problems/two-pointers/container/understand');
}

export const containerExamples = [
  { id: 'container', label: 'Best area survives worse next steps', film: containerFilm([3, 8, 2, 6, 4, 7]) },
  {
    id: 'equal-walls',
    label: 'Equal walls · either end may move',
    film: containerFilm([5, 1, 5], 'problem-container-equal'),
  },
  {
    id: 'zero-heights',
    label: 'Zero heights · width is not enough',
    film: containerFilm([0, 4, 0, 3, 0], 'problem-container-zero'),
  },
];
