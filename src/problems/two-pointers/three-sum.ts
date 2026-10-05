import { scene, pointerFilm, type PointerState } from './story.ts';

export function threeSumFilm(input: number[], id = 'problem-three-sum') {
  const values = [...input].sort((a, b) => a - b);
  const results: number[][] = [];
  const state = (phase: PointerState['phase'], k: number, i: number, j: number, extra = {}): PointerState => ({
    kind: 'triple',
    values,
    k,
    i,
    j,
    target: -values[k],
    results,
    phase,
    ...extra,
  });
  const frames = [
    scene(
      'Prepare',
      'First, sort a copy.',
      'For 3-Sum we want value triplets, not original positions. Sorting unlocks the pair-search rule; a copy keeps the input untouched.',
      { kind: 'triple', values: input, i: -1, j: -1, phase: 'setup', original: true, results: [] },
    ),
  ];
  for (let k = 0; k < values.length - 2; k++) {
    if (k && values[k] === values[k - 1]) {
      frames.push(
        scene(
          'Avoid repeats',
          `Skip repeated anchor ${values[k]}.`,
          'The previous anchor with this value already searched a larger suffix. Repeating it would only repeat value triplets.',
          state('skip', k, k + 1, values.length - 1),
        ),
      );
      continue;
    }
    if (values[k] > 0) {
      frames.push(
        scene(
          'Stop',
          'Positive anchor: nothing left can cancel it.',
          'All remaining values are at least this positive anchor. Their total cannot be zero, so no more anchors are needed.',
          state('anchor', k, k + 1, values.length - 1),
        ),
      );
      break;
    }
    let i = k + 1,
      j = values.length - 1;
    frames.push(
      scene(
        'Fix one',
        `Anchor ${values[k]} → pair target ${-values[k]}`,
        'k stays fixed. i and j search to its right, so the anchor cannot be used twice. This is our sorted Two Sum search again.',
        state('anchor', k, i, j),
      ),
    );
    while (i < j) {
      const sum = values[k] + values[i] + values[j];
      const found = sum === 0;
      if (found) results.push([values[k], values[i], values[j]]);
      frames.push(
        scene(
          'Pair search',
          found ? 'Keep a new triplet.' : sum < 0 ? 'Need a larger total: move i.' : 'Need a smaller total: move j.',
          found
            ? 'Keep this triplet. We still need other unique answers, so this match does not finish the whole problem.'
            : sum < 0
              ? 'Total is too small. With this anchor, the current left value cannot succeed even with the largest partner. Move i right.'
              : 'Total is too large. With this anchor, the current right value cannot succeed even with the smallest partner. Move j left.',
          state('check', k, i, j, { found }),
        ),
      );
      if (found) {
        const leftValue = values[i],
          rightValue = values[j];
        i++;
        j--;
        frames.push(
          scene(
            'Continue',
            'Move both ends after a match.',
            'For these fixed endpoint values, another matching pair would repeat the same value triplet.',
            state('move', k, i, j, { move: 'both' }),
          ),
        );
        while (i < j && values[i] === leftValue) {
          i++;
          frames.push(
            scene(
              'Avoid repeats',
              `Skip repeated pair value ${leftValue}.`,
              'Keep duplicate values in the input; skip only pair choices that would repeat an answer.',
              state('skip', k, i, j),
            ),
          );
        }
        while (i < j && values[j] === rightValue) {
          j--;
          frames.push(
            scene(
              'Avoid repeats',
              `Skip repeated pair value ${rightValue}.`,
              'This endpoint repeats the matched value, so it cannot produce a new value triplet with this anchor.',
              state('skip', k, i, j),
            ),
          );
        }
      } else {
        const move = sum < 0 ? 'i' : 'j';
        if (move === 'i') i++;
        else j--;
        frames.push(
          scene(
            'Discard',
            `Move ${move}. Keep k fixed.`,
            i < j
              ? 'Only the pair search interval shrinks. The anchor remains the same until this scan finishes.'
              : 'This anchor has no unchecked pairs left. Choose the next distinct anchor.',
            state('move', k, i, j, { move }),
          ),
        );
      }
    }
  }
  frames.push(
    scene(
      'Remember',
      `${results.length} unique ${results.length === 1 ? 'triplet' : 'triplets'}`,
      'Fix one value, search for its opposite with a pair, and skip repeated answers—not all duplicate input values.',
      { kind: 'triple', values, i: -1, j: -1, phase: 'done', results },
    ),
  );
  return pointerFilm(id, 'Fix one. Search for two.', frames, '#/problems/two-pointers/three-sum/understand');
}

export const threeSumExamples = [
  { id: 'three-sum', label: 'Two answers · repeated anchor', film: threeSumFilm([2, -1, 4, -3, 0, -1]) },
  {
    id: 'repeat-pairs',
    label: 'Skip repeated matched values',
    film: threeSumFilm([-2, 0, 0, 2, 2], 'problem-three-sum-repeats'),
  },
  {
    id: 'no-triplets',
    label: 'Positive values · no triplets',
    film: threeSumFilm([1, 2, 3, 4], 'problem-three-sum-none'),
  },
];
