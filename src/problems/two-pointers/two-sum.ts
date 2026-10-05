import { scene, pointerFilm, type PointerState } from './story.ts';

export function twoSumFilm(values: number[], target: number, id = 'problem-two-sum') {
  if (values.some((value, index) => index > 0 && value < values[index - 1]))
    throw new Error('Two Sum needs sorted input');
  let i = 0,
    j = values.length - 1;
  const state = (phase: PointerState['phase'], extra = {}): PointerState => ({
    kind: 'sum',
    values,
    i,
    j,
    target,
    phase,
    ...extra,
  });
  const frames = [
    scene(
      'Set up',
      'Values stay put. Boundaries move.',
      `Target ${target}. Start at the smallest and largest available values. Sorted order is what makes the next move meaningful.`,
      state('setup'),
    ),
  ];
  let found = false;
  while (i < j) {
    const sum = values[i] + values[j];
    found = sum === target;
    frames.push(
      scene(
        'Compare',
        found ? 'Found a pair.' : sum < target ? 'Too small: rule out i.' : 'Too large: rule out j.',
        found
          ? `That is ${target}. Two different indices, ${i} and ${j}, give us a pair. No swap or insertion is needed.`
          : sum < target
            ? `Even ${values[j]}, the largest remaining partner, leaves ${values[i]} short. Every pair using index ${i} is too small.`
            : `Even ${values[i]}, the smallest remaining partner, makes ${values[j]} too large. Every pair using index ${j} is too large.`,
        state('check', { found }),
      ),
    );
    if (found) break;
    const move = sum < target ? 'i' : 'j';
    const discarded = move === 'i' ? i++ : j--;
    frames.push(
      scene(
        'Discard',
        `Retire index ${discarded}. Move ${move}.`,
        `The faded endpoint is out of the search, not removed from the array. ${i < j ? 'Only the remaining interval needs checking.' : 'The boundaries have met; no distinct pair remains.'}`,
        state('move', { move }),
      ),
    );
  }
  frames.push(
    scene(
      'Remember',
      found ? `Pair found at indices ${i} and ${j}` : 'No pair reaches the target',
      found
        ? 'The win is not guessing a pair. It is ruling out entire endpoints without overlooking a possible answer.'
        : 'Every discarded endpoint was ruled out by sorted order. Once i and j meet, there are no unchecked distinct pairs.',
      state('done', { found }),
    ),
  );
  return pointerFilm(id, 'A sorted pair search', frames, '#/problems/two-pointers/two-sum/understand');
}

export const twoSumExamples = [
  { id: 'two-sum', label: 'Move both directions · target 14', film: twoSumFilm([1, 3, 5, 7, 9, 12], 14) },
  { id: 'no-pair', label: 'No pair · target 11', film: twoSumFilm([1, 2, 4, 8], 11, 'problem-two-sum-no-pair') },
  {
    id: 'duplicates',
    label: 'Equal values, distinct positions · target 6',
    film: twoSumFilm([-2, 3, 3, 8], 6, 'problem-two-sum-duplicates'),
  },
];
