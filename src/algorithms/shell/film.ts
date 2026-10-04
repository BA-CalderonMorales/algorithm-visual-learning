import { arrayStory } from '../play/story.ts';
import { item, row, frame, sortedRoles, film } from '../../shared/playback/model.ts';

function shellFilm() {
  const values = [2, 1, 6, 3, 0, 5].map(item);
  const even = { 0: 'group', 2: 'group', 4: 'group' };
  const meta = { gap: 2, group: [0, 2, 4] };
  const frames = [
    frame(
      'Groups',
      'Two groups share one array',
      'With gap 2, even indices form [2, 6, 0] and odd indices form [1, 3, 5]. Only the purple group is active.',
      row(values, even),
      meta,
    ),
  ];
  frames.push(
    frame(
      'Hold',
      'Hold key 0 at index 4',
      'i marks where this insertion began. j marks index 2, the next comparison. The held key compares with 6, two positions left.',
      row(values, { ...even, 4: 'key', 2: 'compare' }, { 4: 'i', 2: 'j' }),
      { ...meta, held: '0' },
    ),
  );
  [values[2], values[4]] = [values[4], values[2]];
  frames.push(
    frame(
      'Shift',
      '6 goes right; the open slot goes left',
      'Shift 6 from index 2 to index 4. Key 0 follows the new open slot at index 2; j moves to index 0.',
      row(values, { ...even, 2: 'key', 4: 'shift', 0: 'compare' }, { 4: 'i', 0: 'j' }),
      { ...meta, held: '0' },
    ),
  );
  [values[0], values[2]] = [values[2], values[0]];
  frames.push(
    frame(
      'Shift',
      '2 goes right; key 0 reaches the front',
      'Shift 2 from index 0 to index 2. There is no earlier index in this group. The odd-indexed values did not move.',
      row(values, { ...even, 0: 'key', 2: 'shift' }, { 4: 'i' }),
      { ...meta, held: '0' },
    ),
  );
  frames.push(
    frame(
      'Insert',
      'Insert 0 at index 0',
      'The even group is now [0, 2, 6]. The odd group [1, 3, 5] was already ordered. The full array still contains 6 before 5.',
      row(values, even),
      meta,
    ),
  );
  frames.push(
    frame(
      'Gap one',
      'Shrink the gap to 1',
      'Every position now belongs to one group. The first five values form an ordered prefix; hold the final key 5 and compare with 6.',
      row(values, { ...sortedRoles(5), 5: 'key', 4: 'compare' }, { 5: 'i', 4: 'j' }),
      { gap: 1, group: [0, 1, 2, 3, 4, 5], held: '5' },
    ),
  );
  [values[4], values[5]] = [values[5], values[4]];
  frames.push(
    frame(
      'Gap one',
      'Shift 6 one slot right',
      'Key 5 now follows the open slot at index 4. Compare with 3 at index 3; 3 is smaller, so stop shifting.',
      row(values, { ...sortedRoles(4), 4: 'key', 5: 'shift', 3: 'compare' }, { 5: 'i', 3: 'j' }),
      { gap: 1, group: [0, 1, 2, 3, 4, 5], held: '5' },
    ),
  );
  frames.push(
    frame(
      'Remember',
      'The gap controls the distance',
      'Insert 5 after 3. Gap 2 ordered separate groups; gap 1 joined them into one sorted array.',
      row(values, sortedRoles(6)),
    ),
  );
  return arrayStory('shell', frames);
}

export const playFilms = {
  shell: film(
    'shell',
    'Follow one gap-group.',
    'A key moves left by the gap. It never jumps into a different group during that pass.',
    shellFilm(),
    [
      { title: 'Recognize ordinary insertion', href: '#/algorithms/insertion/play' },
      { title: 'Why gap choice matters', href: '#/algorithms/shell/complexity' },
    ],
    'Gap sequence: 2, 1. The blue held key follows the open slot; code stores it separately.',
  ),
};
export const legend = [
  ['group', 'Active gap group / pointers'],
  ['key', 'Held key'],
  ['compare', 'Next comparison'],
  ['shift', 'Value moving right'],
  ['sorted', 'Completed insertion'],
];
