import { arrayStory } from '../play/story.ts';
import { item, row, frame, sortedRoles, film } from '../../shared/playback/model.ts';

function insertionFilm(initial = [4, 7, 8, 2, 5], gaps = [1]) {
  const values = initial.map(item);
  const shell = gaps.length > 1;
  const frames = [
    frame(
      shell ? 'Groups' : 'Prefix',
      shell ? 'Distance defines the group' : 'A sorted prefix grows',
      shell
        ? 'Begin with gap 2. Even and odd indices form separate groups; a key only travels through its own group.'
        : 'The first value is a sorted prefix of size one. Each new key will find a place inside that prefix.',
      row(values, shell ? {} : sortedRoles(1)),
      {
        gap: shell ? gaps[0] : 1,
        prefix: shell ? 0 : 1,
        operation: shell ? undefined : 'Start with [4] sorted · process the next key',
      },
    ),
  ];
  for (const gap of gaps) {
    if (shell && gap === 1)
      frames.push(
        frame(
          'Gap one',
          'Bring the groups together',
          'Gap 2 ordered each group, not the entire array. Gap 1 now compares neighbors and finishes the sort.',
          row(values),
          { gap },
        ),
      );
    for (let i = gap; i < values.length; i++) {
      const key = values[i];
      const group = Array.from({ length: values.length }, (_, k) => k).filter((k) => k % gap === i % gap);
      const groupRoles = shell ? Object.fromEntries(group.map((k) => [k, 'group'])) : sortedRoles(i);
      let open = i;
      frames.push(
        frame(
          shell ? `Gap ${gap}` : 'Key',
          `Hold key ${key.value}`,
          `Compare key ${key.value} with ${values[open - gap].value} at index ${open - gap}. ${shell ? `Move ${gap} positions left within this group.` : 'Everything before the key is already sorted.'}`,
          row(values, { ...groupRoles, [open]: 'key', [open - gap]: 'compare' }, { [i]: 'i', [open - gap]: 'j' }),
          { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i },
        ),
      );
      while (open >= gap && Number(values[open - gap].value) > Number(key.value)) {
        const from = open - gap;
        const moved = values[from];
        // The held token follows the open slot visually; the code holds it separately.
        [values[from], values[open]] = [key, moved];
        open = from;
        const next =
          open >= gap
            ? ` Next compare ${values[open - gap].value} at index ${open - gap}.`
            : ' The key has reached the front of this group.';
        frames.push(
          frame(
            shell ? `Gap ${gap}` : 'Shift',
            `${moved.value} right; key ${key.value} left`,
            `Shift ${moved.value} from index ${from} to ${from + gap}. The blue key follows the new open slot.${next}`,
            row(
              values,
              {
                ...groupRoles,
                [open]: 'key',
                [open + gap]: 'shift',
                ...(open >= gap ? { [open - gap]: 'compare' } : {}),
              },
              { [i]: 'i', ...(open >= gap ? { [open - gap]: 'j' } : {}) },
            ),
            { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i },
          ),
        );
      }
      frames.push(
        frame(
          shell ? `Gap ${gap}` : 'Insert',
          `Insert ${key.value} at index ${open}`,
          open === i
            ? `The left neighbor is no larger than key ${key.value}. No shift is needed; this pass is complete.`
            : `The key belongs here. ${shell ? 'This part of its gap-group is ordered.' : `The sorted prefix now has ${i + 1} values.`}`,
          row(values, shell ? { ...groupRoles, [open]: 'sorted' } : sortedRoles(i + 1), { [i]: 'i' }),
          { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i + 1 },
        ),
      );
    }
  }
  frames.push(
    frame(
      'Remember',
      shell ? 'Same insertion. A shrinking gap.' : 'Shift right. Grow left.',
      shell
        ? 'Large gaps let values travel far early. Gap 1 finishes with ordinary insertion sort.'
        : 'The key moved left while larger values moved right. Each completed insertion kept the prefix sorted.',
      row(values, sortedRoles(values.length)),
    ),
  );
  return arrayStory(shell ? 'shell' : 'insertion', frames);
}

export const playFilms = {
  insertion: film(
    'insertion',
    'Give the key a place.',
    'Larger values shift right while the held key finds its place to the left.',
    insertionFilm(),
    [
      { title: 'Why the prefix stays sorted', href: '#/discrete/induction' },
      { title: 'Compare input cases', href: '#/algorithms/insertion/growth' },
    ],
    'The blue key follows the open slot visually. The implementation holds it separately until insertion.',
  ),
};
export const legend = [
  ['key', 'Held key'],
  ['compare', 'Compare to the left'],
  ['shift', 'Value moving right'],
  ['sorted', 'Completed prefix'],
  ['group', 'i / j pointers'],
];
