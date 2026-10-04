import { arrayStory } from '../play/story.ts';
import { item, row, frame, sortedRoles, film } from '../../shared/playback/model.ts';

function selectionFilm() {
  const values = [4, 1, 3, 5, 2].map(item);
  const frames = [
    frame(
      'Find',
      'One place to fill.',
      'The left boundary i is the next position to fill. Remember 4 as the first minimum, then scan everything to its right.',
      row(values, { 0: 'key' }, { 0: 'i' }),
      { operation: 'Fill index 0 · start with minimum 4 · scan right' },
    ),
  ];
  for (let i = 0; i < values.length - 1; i++) {
    let minimum = i;
    for (let j = i + 1; j < values.length; j++) {
      const smaller = Number(values[j].value) < Number(values[minimum].value);
      const old = minimum;
      if (smaller) minimum = j;
      frames.push(
        frame(
          'Find',
          smaller ? `${values[j].value} becomes the minimum` : `${values[minimum].value} stays the minimum`,
          `Compare ${values[j].value} with ${values[old].value}. ${smaller ? 'Remember the smaller value; the array stays put.' : 'Keep scanning; this value does not beat the minimum.'}`,
          row(
            values,
            { ...sortedRoles(i), [minimum]: 'key', [j]: smaller ? 'key' : 'compare' },
            { [i]: 'i', [j]: 'j' },
          ),
        ),
      );
    }
    const chosen = values[minimum].value;
    [values[i], values[minimum]] = [values[minimum], values[i]];
    frames.push(
      frame(
        'Place',
        `Fix ${chosen} at index ${i}`,
        minimum === i
          ? 'The minimum is already at the boundary. Grow the sorted prefix without a swap.'
          : `The scan is complete. Swap ${chosen} into index ${i}; only now does the sorted prefix grow.`,
        row(values, { ...sortedRoles(i + 1), ...(minimum !== i ? { [minimum]: 'shift' } : {}) }, { [i]: 'i' }),
      ),
    );
  }
  frames.push(
    frame(
      'Remember',
      'Scan first. Place once.',
      'Every suffix was scanned completely. The prefix now contains all values in sorted order.',
      row(values, sortedRoles(values.length)),
    ),
  );
  return arrayStory('selection', frames);
}

export const playFilms = {
  selection: film(
    'selection',
    'Scan first. Place once.',
    'The minimum changes in your memory before anything moves in the array.',
    selectionFilm(),
    [
      { title: 'Why the scans form n²', href: '#/complexity/time' },
      { title: 'Follow every comparison', href: '#/algorithms/selection/walkthrough' },
    ],
  ),
};
export const legend = [
  ['key', 'Smallest found'],
  ['compare', 'Value being checked'],
  ['shift', 'Swap in progress'],
  ['sorted', 'Fixed prefix'],
  ['group', 'i / j pointers'],
];
