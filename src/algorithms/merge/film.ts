import { item, frame, film } from '../../shared/playback/model.ts';

export function mergeFilm(tim = false) {
  const values = (tim ? [1, 4, 7, 2, 3, 6] : [7, 1, 4, 6, 2, 3]).map(item);
  let left = values.slice(0, 3),
    right = values.slice(3);
  let leftSorted = false,
    rightSorted = false,
    leftUsed = 0,
    rightUsed = 0;
  const output = Array(values.length).fill(null);
  const frames = [];
  const add = (chapter, title, caption, phase, operation, extra = {}) => {
    const tokens = [
      ...left.map((v, i) => ({ ...v, x: (i + 0.5) / 3, y: 0.2, role: 'neutral', index: String(i) })),
      ...right.map((v, i) => ({ ...v, x: (i + 0.5) / 3, y: 0.5, role: 'neutral', index: String(i) })),
    ].filter((v) => !output.some((o) => o?.id === v.id));
    tokens.push(
      ...output.flatMap((v, i) => (v ? [{ ...v, x: (i + 0.5) / 6, y: 0.82, role: 'sorted', index: String(i) }] : [])),
    );
    frames.push(
      frame(chapter, title, caption, tokens, {
        duration: 4.8,
        operation,
        merge: {
          phase,
          input: values.map((v) => ({ ...v })),
          left: left.map((v) => ({ ...v })),
          right: right.map((v) => ({ ...v })),
          leftSorted,
          rightSorted,
          leftUsed,
          rightUsed,
          output: output.map((v) => (v ? { ...v } : null)),
          tim,
          ...extra,
        },
      }),
    );
  };
  add(
    tim ? 'Runs' : 'Split',
    tim ? 'Look for order already in the input.' : 'Start with one unsorted array.',
    tim
      ? 'Scan left to right. An ascending run can be reused instead of sorted from scratch.'
      : 'Split the array into two halves. Each half solves the same sorting problem on fewer values.',
    'input',
    tim ? '1 ≤ 4 ≤ 7 · then 2 begins a new run' : '6 items → two halves of 3',
  );
  if (!tim) {
    add(
      'Split',
      'Two halves. Neither is sorted yet.',
      'The left half is [7, 1, 4]; the right half is [6, 2, 3]. Keep splitting each half.',
      'split',
      'Left [7, 1, 4] · right [6, 2, 3]',
    );
    add(
      'Split',
      'Single values stop the recursion.',
      'A range of size one is already sorted. Start merging these tiny ranges into larger sorted ranges.',
      'singletons',
      '[7] [1] [4]     [6] [2] [3]',
    );
    add(
      'Small merges',
      'The left pair needs no exchange.',
      'Compare 1 and 4. Their pair is already ordered. Now merge [7] with the sorted pair [1, 4].',
      'left-pair',
      '1 ≤ 4 → sorted pair [1, 4]',
    );
    left = [...left].sort((a, b) => Number(a.value) - Number(b.value));
    leftSorted = true;
    add(
      'Small merges',
      'The left half becomes [1, 4, 7].',
      'Merge [7] and [1, 4]: take 1, then 4, then the remaining 7. Only the left half changes.',
      'left-ready',
      'Fronts 7 and 1 → take 1, then 4, then 7',
    );
    add(
      'Small merges',
      'The right pair is already ordered.',
      'Compare 2 and 3. Merge their sorted pair [2, 3] with [6]; the finished left half stays put.',
      'right-pair',
      '2 ≤ 3 → sorted pair [2, 3]',
    );
    right = [...right].sort((a, b) => Number(a.value) - Number(b.value));
    rightSorted = true;
    add(
      'Small merges',
      'The right half becomes [2, 3, 6].',
      'Merge [6] and [2, 3]: take 2, then 3, then the remaining 6. Both halves are now sorted.',
      'right-ready',
      'Fronts 6 and 2 → take 2, then 3, then 6',
    );
  } else {
    leftSorted = true;
    add(
      'Runs',
      'The first run is [1, 4, 7].',
      '1 ≤ 4 ≤ 7, but 2 is smaller than 7, so it starts a new run. The first run is already sorted.',
      'left-ready',
      '1 ≤ 4 ≤ 7 · stop the first run before 2',
    );
    rightSorted = true;
    add(
      'Runs',
      'The second run is [2, 3, 6].',
      '2 ≤ 3 ≤ 6. This teaching example uses minimum run length 3, so neither run needs insertion-sort extension.',
      'right-ready',
      '2 ≤ 3 ≤ 6 · both runs are long enough',
    );
  }
  add(
    'Merge',
    'Compare only the unused fronts.',
    'Each source is sorted. Its front is its smallest unused value. Choose the smaller front to fill the next output slot.',
    'merge',
    'Left front 1 vs right front 2 → take 1',
  );
  for (let target = 0; target < output.length; target++) {
    const a = left[leftUsed],
      b = right[rightUsed];
    const source = !b || (a && Number(a.value) <= Number(b.value)) ? 'left' : 'right';
    const sourceIndex = source === 'left' ? leftUsed++ : rightUsed++;
    const chosen = (source === 'left' ? left : right)[sourceIndex];
    output[target] = { ...chosen };
    add(
      'Merge',
      `Copy ${chosen.value} into output slot ${target}.`,
      a && b
        ? `Compare ${a.value} and ${b.value}. Copy the smaller front, ${chosen.value}, into slot ${target}. Advance only the ${source} pointer.`
        : `The ${source === 'left' ? 'right' : 'left'} source is exhausted. Copy ${chosen.value} from the remaining source into slot ${target}.`,
      'place',
      a && b
        ? `${a.value} vs ${b.value} → ${chosen.value} goes to output[${target}]`
        : `One source exhausted → copy ${chosen.value} into output[${target}]`,
      { source, sourceIndex, target, chosenId: chosen.id, compared: [a?.id, b?.id].filter(Boolean) },
    );
  }
  add(
    'Remember',
    tim ? 'Reuse order. Merge the runs.' : 'Small sorted ranges build the whole.',
    tim
      ? 'This example needed a scan and one merge. Short runs would first be extended by insertion sort; production TimSort also balances its run stack.'
      : 'Every output slot is filled in order. Splitting reached simple base cases; merging built larger sorted ranges from them.',
    'done',
    'All 6 output slots are filled in sorted order',
  );
  return frames;
}

export const playFilms = {
  merge: film(
    'merge',
    'Take the smaller front.',
    'Two sorted runs let you choose the next output value with one front comparison.',
    mergeFilm(),
    [
      { title: 'Why merging costs n per level', href: '#/discrete/master-theorem' },
      { title: 'Where the buffer lives', href: '#/complexity/space' },
    ],
  ),
};
export const legend = [
  ['group', 'Halves / pointers'],
  ['compare', 'Unused fronts'],
  ['key', 'Copy into output'],
  ['sorted', 'Sorted ranges / output'],
];
