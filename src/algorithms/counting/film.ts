import { item, frame, film } from '../../shared/playback/model.ts';

function countingFilm() {
  const values = [2, 1, 2, 0, 3, 1].map(item);
  const counts = [0, 0, 0, 0];
  const output = Array(values.length).fill(null);
  const inputRow = () => values.map((v, i) => ({ ...v, x: (i + 0.5) / 6, y: 0.2, role: 'neutral', index: String(i) }));
  const buckets = () =>
    counts.map((v, i) => ({
      id: `bucket${i}`,
      value: String(v),
      x: (i + 1) / 5,
      y: 0.48,
      role: 'group',
      index: `value ${i}`,
    }));
  let frequency, ends;
  const snapshot = (phase, action = {}) => ({
    phase,
    input: values.map((v) => ({ ...v })),
    counts: [...counts],
    frequency: frequency ? [...frequency] : null,
    ends: ends ? [...ends] : null,
    output: output.map((v) => (v ? { ...v } : null)),
    ...action,
  });
  const outputRow = () =>
    output.flatMap((v, i) => (v ? [{ ...v, x: (i + 0.5) / 6, y: 0.78, role: 'sorted', index: String(i) }] : []));
  const add = (chapter, title, caption, phase, action = {}) =>
    frames.push(
      frame(
        chapter,
        title,
        caption,
        [...inputRow().filter((v) => !output.some((o) => o?.id === v.id)), ...buckets(), ...outputRow()],
        { duration: 4.2, counting: snapshot(phase, action) },
      ),
    );
  const frames = [];
  add(
    'Set up',
    '6 items. 4 possible values.',
    'The values run from 0 to 3. Create four zero-filled buckets, and six empty output slots.',
    'setup',
  );
  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i].value),
      before = counts[v];
    counts[v]++;
    add(
      'Count',
      `Read ${v}. Count one more ${v}.`,
      `Input index ${i} contains ${v}. Add one to bucket ${v}: ${before} → ${counts[v]}. The input stays unchanged.`,
      'count',
      { activeInput: i, activeBucket: v, before, after: counts[v] },
    );
  }
  frequency = [...counts];
  add(
    'Count',
    'Now we know how many of each.',
    'One 0, two 1s, two 2s, and one 3. These are frequencies, not output indices.',
    'frequencies',
  );
  for (let v = 1; v < counts.length; v++) {
    const before = counts[v],
      addend = counts[v - 1];
    counts[v] += addend;
    add(
      'Find ranges',
      `How many values are at most ${v}?`,
      `${before} value${before === 1 ? '' : 's'} equal ${v}, plus ${addend} smaller values. Total: ${counts[v]}. ${v}s belong at output indices ${addend}–${counts[v] - 1}.`,
      'prefix',
      { activeBucket: v, before, addend, after: counts[v] },
    );
  }
  ends = [...counts];
  add(
    'Find ranges',
    'Each value has its own output range.',
    'The bucket numbers now count values up to each value. Subtract one to find the rightmost free slot in that range.',
    'ranges',
  );
  for (let i = values.length - 1; i >= 0; i--) {
    const chosen = values[i],
      v = Number(chosen.value),
      before = counts[v],
      target = --counts[v];
    output[target] = { ...chosen, sourceIndex: i };
    add(
      'Place',
      `Copy ${v} into output slot ${target}.`,
      `Bucket ${v}: ${before} − 1 = ${target}. Copy input[${i}] there. Reading right to left keeps equal values in their original order.`,
      'place',
      { activeInput: i, activeBucket: v, before, after: counts[v], target },
    );
    frames.at(-1).duration = 4.8;
  }
  frames.push(
    frame(
      'Remember',
      'Count → find ranges → fill slots.',
      'The output is sorted. The small i labels show where each copy came from: equal values kept their original order.',
      outputRow(),
      { duration: 4.8, counting: snapshot('done') },
    ),
  );
  return frames;
}

export const playFilms = {
  counting: film(
    'counting',
    'A value points to a bucket.',
    'n counts input items. k counts possible integers in the inclusive value range.',
    countingFilm(),
    [
      { title: 'Understand n + k work', href: '#/algorithms/counting/complexity' },
      { title: 'Count the extra storage', href: '#/complexity/space' },
    ],
  ),
};
export const legend = [
  ['compare', 'Reading input'],
  ['key', 'Active bucket / copy path'],
  ['group', 'Output range'],
  ['sorted', 'Written output'],
];
