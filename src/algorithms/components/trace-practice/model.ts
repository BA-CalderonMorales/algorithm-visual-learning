export function shellTrace(input: number[], gaps = [3, 1]) {
  const values = [...input];
  const states = [
    {
      values: [...values],
      title: 'Start with the original array',
      why: 'Indices stay fixed; values will move inside one gap group at a time.',
      gap: gaps[0],
      group: [],
      held: null,
    },
  ];
  for (const gap of gaps) {
    for (let i = gap; i < values.length; i++) {
      const key = values[i];
      let j = i;
      const group = Array.from({ length: Math.ceil((values.length - (i % gap)) / gap) }, (_, k) => (i % gap) + k * gap);
      while (j >= gap && values[j - gap] > key) {
        const moved = values[j - gap];
        values[j] = moved;
        states.push({
          values: [...values],
          title: `Gap ${gap}: shift ${moved} from ${j - gap} to ${j}`,
          why: `Hold key ${key} separately. Only indices in the same gap group participate.`,
          gap,
          group,
          held: key,
        });
        j -= gap;
      }
      values[j] = key;
      states.push({
        values: [...values],
        title: `Gap ${gap}: insert key ${key} at ${j}`,
        why: 'The processed prefix of this gap group is sorted. Other groups are separate.',
        gap,
        group,
        held: null,
      });
    }
    states.push({
      values: [...values],
      title: `Gap-${gap} pass complete`,
      why: gap === 1 ? 'Gap one orders the entire array.' : 'Each gap group is sorted; adjacent positions need not be.',
      gap,
      group: [],
      held: null,
    });
  }
  return states;
}

export function quickTrace(input: number[]) {
  const values = [...input],
    low = 0,
    high = values.length - 1,
    mid = Math.floor((low + high) / 2);
  if (values.length < 3) throw new Error('This median-of-three trace requires at least three items.');
  const states = [];
  const add = (title, why, group = [], held = null) =>
    states.push({ values: [...values], title, why, group, held, gap: 0 });
  const swap = (a, b) => {
    [values[a], values[b]] = [values[b], values[a]];
  };
  add(
    'Inspect left, center, and right samples',
    'This trace uses median-of-three with the pivot parked at high−1 and endpoint sentinels.',
    [low, mid, high],
  );
  if (values[low] > values[mid]) swap(low, mid);
  if (values[low] > values[high]) swap(low, high);
  if (values[mid] > values[high]) swap(mid, high);
  add('Order the three sample values', 'The minimum and maximum samples guard the scans.', [low, mid, high]);
  swap(mid, high - 1);
  const pivot = values[high - 1];
  add(`Park pivot ${pivot} at index ${high - 1}`, 'Begin scans just inside the endpoint sentinels.', [high - 1], pivot);
  let i = low,
    j = high - 1;
  while (true) {
    do {
      i++;
    } while (values[i] < pivot);
    do {
      j--;
    } while (values[j] > pivot);
    add(
      `Scans stop at i=${i}, j=${j}`,
      i < j
        ? 'Values on the wrong sides can now be exchanged.'
        : 'Pointers have met or crossed; do not perform another regular pair swap.',
      [i, j],
      pivot,
    );
    if (i >= j) break;
    swap(i, j);
    add(
      `Swap indices ${i} and ${j}`,
      'Resume both scans. One successful swap does not finish the partition.',
      [i, j],
      pivot,
    );
  }
  swap(i, high - 1);
  add(
    `Place pivot ${pivot} at index ${i}`,
    'Every value to its left is at most the pivot; every value to its right is at least it. The two sides are not necessarily sorted.',
    [i],
    pivot,
  );
  return states;
}

export function predictionOptions(current, next) {
  const correct = next.values.join(', ');
  const alternatives = [current.values.join(', '), [...next.values].reverse().join(', ')];
  for (let k = 1; new Set([correct, ...alternatives]).size < 3 && k < 10; k++) {
    const wrong = [...next.values];
    wrong[k % wrong.length] += k;
    alternatives.push(wrong.join(', '));
  }
  return [...new Set([correct, ...alternatives])].slice(0, 3);
}
