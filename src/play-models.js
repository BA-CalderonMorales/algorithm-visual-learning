// Model: authored explanations and stable object identities, independent of playback.
// Coordinates belong to the diagram, not to the DOM or a particular viewport.
const item = (value, index) => ({ id: `v${index}`, value: String(value) });
const row = (values, roles = {}, pointers = {}, y = 0.42) => values.map((value, index) => ({
  ...value, x: (index + 0.5) / values.length, y,
  role: roles[index] || 'neutral', index: String(index), pointer: pointers[index] || '',
}));
const frame = (chapter, title, caption, tokens = [], extra = {}) => ({
  chapter, title, caption, tokens, duration: Math.max(3.2, caption.split(' ').length / 4.8), ...extra,
});
const text = (id, value, x, y, role = 'neutral', size = 1) => ({ id, text: value, x, y, role, size });
const lane = (id, label, start, end, y, role = 'sorted') => ({ id, label, start, end, y, role });
const sortedRoles = (count) => Object.fromEntries(Array.from({ length: count }, (_, i) => [i, 'sorted']));

// Small readouts explain the current decision; coordinates and item identities
// remain separate so index labels stay anchored during swaps and shifts.
function arrayStory(id, frames) {
  return frames.map((scene, index) => {
    const previous = frames[Math.max(0, index - 1)];
    const key = scene.tokens.find(t => t.role === 'key');
    const atPointer = pointer => scene.tokens.find(t => t.pointer?.split(' · ').includes(pointer));
    const i = atPointer('i'), j = atPointer('j');
    const moves = scene.tokens.flatMap(token => {
      const old = previous.tokens.find(t => t.id === token.id);
      return old && old.x !== token.x ? [{ value: token.value, from: old.index, to: token.index, key: token.role === 'key' }] : [];
    });
    let operation = scene.operation;
    if (!operation && moves.length) {
      const shifted = moves.find(move => !move.key);
      operation = scene.held && shifted ? `${shifted.value} > key ${scene.held} → shift ${shifted.value} right`
        : `Swap ${moves[0].value} and ${moves[1]?.value} · indices ${moves[0].from} ↔ ${moves[0].to}`;
    }
    if (!operation && j) {
      const comparison = id === 'selection' ? previous.tokens.find(t => t.role === 'key') ?? i : key;
      if (comparison) operation = id === 'selection'
        ? `${j.value} ${Number(j.value) < Number(comparison.value) ? '<' : '≥'} ${comparison.value} → ${Number(j.value) < Number(comparison.value) ? 'remember the smaller value' : 'keep the minimum'}`
        : `Compare ${j.value} at index ${j.index} with ${id === 'quick' ? 'pivot' : 'key'} ${comparison.value}`;
    }
    operation ??= scene.held ? `Key ${scene.held} belongs at index ${scene.open ?? key?.index ?? 'shown'}`
      : id === 'shell' && scene.group ? `Gap ${scene.gap}: only indices ${scene.group.join(' → ')} belong to this group`
      : id === 'quick' ? 'Only fixed pivots are finished; each side still needs sorting'
      : 'Green marks the part already in its final order';
    if (index === frames.length - 1) operation = 'Every position is now sorted';
    const fact = (label, value, role = 'group') => ({ label, value: String(value ?? '—'), role });
    const facts = id === 'selection' ? [fact('Fill index i', i?.index), fact('Scan index j', j?.index), fact('Minimum', key?.value ?? i?.value, 'key')]
      : id === 'insertion' ? [fact('Held key', scene.held, 'key'), fact('Compare index j', j?.index), fact('Key position', scene.open ?? key?.index, 'key')]
      : id === 'shell' ? [fact('Gap', scene.gap ?? 1), fact('Held key', scene.held, 'key'), fact('Compare index j', j?.index)]
      : [fact('Pivot', key?.value, 'key'), fact('Scan indices i / j', `${i?.index ?? '—'} / ${j?.index ?? '—'}`), fact('Active range', scene.range ?? '0–8')];
    if (index === frames.length - 1) facts.splice(0, 3, fact('Sorted values', scene.tokens.length, 'sorted'), fact('Remaining', 0, 'sorted'), fact('Status', 'Complete', 'sorted'));
    return { ...scene, duration: Math.max(4.2, scene.duration), operation, facts };
  });
}

function selectionFilm() {
  const values = [4, 1, 3, 5, 2].map(item);
  const frames = [frame('Find', 'One place to fill.', 'The left boundary i is the next position to fill. Remember 4 as the first minimum, then scan everything to its right.', row(values, {0:'key'}, { 0: 'i' }), {operation:'Fill index 0 · start with minimum 4 · scan right'})];
  for (let i = 0; i < values.length - 1; i++) {
    let minimum = i;
    for (let j = i + 1; j < values.length; j++) {
      const smaller = Number(values[j].value) < Number(values[minimum].value);
      const old = minimum;
      if (smaller) minimum = j;
      frames.push(frame('Find', smaller ? `${values[j].value} becomes the minimum` : `${values[minimum].value} stays the minimum`,
        `Compare ${values[j].value} with ${values[old].value}. ${smaller ? 'Remember the smaller value; the array stays put.' : 'Keep scanning; this value does not beat the minimum.'}`,
        row(values, { ...sortedRoles(i), [minimum]: 'key', [j]: smaller ? 'key' : 'compare' }, { [i]: 'i', [j]: 'j' })));
    }
    const chosen = values[minimum].value;
    [values[i], values[minimum]] = [values[minimum], values[i]];
    frames.push(frame('Place', `Fix ${chosen} at index ${i}`, minimum === i ? 'The minimum is already at the boundary. Grow the sorted prefix without a swap.' : `The scan is complete. Swap ${chosen} into index ${i}; only now does the sorted prefix grow.`,
      row(values, { ...sortedRoles(i + 1), ...(minimum !== i ? { [minimum]: 'shift' } : {}) }, { [i]: 'i' })));
  }
  frames.push(frame('Remember', 'Scan first. Place once.', 'Every suffix was scanned completely. The prefix now contains all values in sorted order.', row(values, sortedRoles(values.length))));
  return arrayStory('selection', frames);
}

function insertionFilm(initial = [4, 7, 8, 2, 5], gaps = [1]) {
  const values = initial.map(item);
  const shell = gaps.length > 1;
  const frames = [frame(shell ? 'Groups' : 'Prefix', shell ? 'Distance defines the group' : 'A sorted prefix grows', shell
    ? 'Begin with gap 2. Even and odd indices form separate groups; a key only travels through its own group.'
    : 'The first value is a sorted prefix of size one. Each new key will find a place inside that prefix.', row(values, shell ? {} : sortedRoles(1)), { gap: shell ? gaps[0] : 1, prefix:shell?0:1, operation:shell?undefined:'Start with [4] sorted · process the next key'})];
  for (const gap of gaps) {
    if (shell && gap === 1) frames.push(frame('Gap one', 'Bring the groups together', 'Gap 2 ordered each group, not the entire array. Gap 1 now compares neighbors and finishes the sort.', row(values), { gap }));
    for (let i = gap; i < values.length; i++) {
      const key = values[i];
      const group = Array.from({ length: values.length }, (_, k) => k).filter(k => k % gap === i % gap);
      const groupRoles = shell ? Object.fromEntries(group.map(k => [k, 'group'])) : sortedRoles(i);
      let open = i;
      frames.push(frame(shell ? `Gap ${gap}` : 'Key', `Hold key ${key.value}`, `Compare key ${key.value} with ${values[open - gap].value} at index ${open - gap}. ${shell ? `Move ${gap} positions left within this group.` : 'Everything before the key is already sorted.'}`,
        row(values, { ...groupRoles, [open]: 'key', [open - gap]: 'compare' }, { [i]: 'i', [open - gap]: 'j' }), { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i }));
      while (open >= gap && Number(values[open - gap].value) > Number(key.value)) {
        const from = open - gap;
        const moved = values[from];
        // The held token follows the open slot visually; the code holds it separately.
        [values[from], values[open]] = [key, moved];
        open = from;
        const next = open >= gap ? ` Next compare ${values[open - gap].value} at index ${open - gap}.` : ' The key has reached the front of this group.';
        frames.push(frame(shell ? `Gap ${gap}` : 'Shift', `${moved.value} right; key ${key.value} left`, `Shift ${moved.value} from index ${from} to ${from + gap}. The blue key follows the new open slot.${next}`,
          row(values, { ...groupRoles, [open]: 'key', [open + gap]: 'shift', ...(open >= gap ? { [open - gap]: 'compare' } : {}) }, { [i]: 'i', ...(open >= gap ? { [open - gap]: 'j' } : {}) }), { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i }));
      }
      frames.push(frame(shell ? `Gap ${gap}` : 'Insert', `Insert ${key.value} at index ${open}`, open === i
        ? `The left neighbor is no larger than key ${key.value}. No shift is needed; this pass is complete.`
        : `The key belongs here. ${shell ? 'This part of its gap-group is ordered.' : `The sorted prefix now has ${i + 1} values.`}`,
        row(values, shell ? { ...groupRoles, [open]: 'sorted' } : sortedRoles(i + 1), { [i]: 'i' }), { gap, group: shell ? group : undefined, held: key.value, open, prefix: shell ? 0 : i + 1 }));
    }
  }
  frames.push(frame('Remember', shell ? 'Same insertion. A shrinking gap.' : 'Shift right. Grow left.', shell
    ? 'Large gaps let values travel far early. Gap 1 finishes with ordinary insertion sort.'
    : 'The key moved left while larger values moved right. Each completed insertion kept the prefix sorted.', row(values, sortedRoles(values.length))));
  return arrayStory(shell ? 'shell' : 'insertion', frames);
}

function quickFilm() {
  const values = [4, 7, 8, 2, 9, 5, 6, 3, 1].map(item);
  const frames = [frame('Pivot', 'Choose the middle sample value.', 'Sample the left, center, and right: 4, 9, and 1. Their median is 4. First, order those samples.', row(values, { 0: 'compare', 4: 'compare', 8: 'compare' }), { operation: 'Samples 4, 9, 1 → pivot value 4' })];
  [values[0], values[8]] = [values[8], values[0]];
  frames.push(frame('Pivot', 'Put the smallest sample on the left.', 'Swap 4 and 1. Only these two values move. The chosen pivot value is still 4.', row(values, { 8: 'key', 0: 'shift' })));
  [values[4], values[8]] = [values[8], values[4]];
  frames.push(frame('Pivot', 'Put 4 between the other samples.', 'Swap 9 and 4. The samples are now 1, 4, and 9; pivot 4 is at the center.', row(values, { 4: 'key', 8: 'shift' })));
  [values[4], values[7]] = [values[7], values[4]];
  frames.push(frame('Partition', 'Park 4. Find two misplaced values.', 'Park pivot 4 at index 7. i stops at 7, which is too large. j stops at 3, which is too small.', row(values, { 7: 'key', 1: 'compare', 4: 'compare' }, { 1: 'i', 4: 'j' }), { operation: 'i finds 7 > 4 · j finds 3 < 4' }));
  [values[1], values[4]] = [values[4], values[1]];
  frames.push(frame('Partition', 'Swap 7 and 3.', '7 belongs on the right of the pivot; 3 belongs on the left. Swap them. Pivot 4 stays parked.', row(values, { 7: 'key', 1: 'shift', 4: 'shift' }, { 1: 'i', 4: 'j' })));
  frames.push(frame('Partition', 'Keep scanning toward the middle.', 'The next stopped values are 8 and 2. Again, the large value is on the left and the small value is on the right.', row(values, { 7: 'key', 2: 'compare', 3: 'compare' }, { 2: 'i', 3: 'j' }), { operation: 'i finds 8 > 4 · j finds 2 < 4' }));
  [values[2], values[3]] = [values[3], values[2]];
  frames.push(frame('Partition', 'Swap 8 and 2.', 'Move 2 left and 8 right. Then advance i and retreat j to look for the next pair.', row(values, { 7: 'key', 2: 'shift', 3: 'shift' }, { 2: 'i', 3: 'j' })));
  frames.push(frame('Partition', 'The scans have crossed. Stop.', 'i is now 3 and j is 2. There is no stopped pair left to exchange. The pivot can take its final position.', row(values, { 7: 'key', 3: 'compare', 2: 'compare' }, { 3: 'i', 2: 'j' }), { operation: 'i = 3 > j = 2 → stop scanning' }));
  [values[3], values[7]] = [values[7], values[3]];
  const split = [lane('s1', 'S1 · unsorted', 0, 3 / 9, 0.61, 'group'), lane('p', 'Fixed', 3 / 9, 4 / 9, 0.61, 'sorted'), lane('s2', 'S2 · unsorted', 4 / 9, 1, 0.61, 'group')];
  frames.push(frame('Recurse', '4 is fixed. Each side is a new problem.', 'Swap pivot 4 with A[i]. Every value on the left is smaller; every value on the right is larger. The sides still need sorting.', row(values, { 3: 'key', 7: 'shift' }), { lanes: split, fixed: [3] }));
  [values[1], values[2]] = [values[2], values[1]];
  const remaining = [lane('left', 'Finished', 0, 4 / 9, 0.61, 'sorted'), lane('s2', 'S2 · unsorted', 4 / 9, 1, 0.61, 'group')];
  frames.push(frame('Recurse', 'Finish the small left side.', 'S1 has only three values. Insertion sort moves 2 before 3. Pivot 4 stays fixed; we can now focus on S2.', row(values, { ...sortedRoles(4) }), { lanes: remaining, fixed: [3], operation: 'Small S1 → insertion sort · swap 3 and 2', range: '0–2' }));
  [values[4], values[6]] = [values[6], values[4]];
  frames.push(frame('Recurse', 'Choose 7 inside the right side.', 'S2 has five values, so partition again. Its samples are 7, 6, and 9. Order them; their median is 7.', row(values, { ...sortedRoles(4), 6: 'key', 4: 'shift' }), { lanes: remaining, fixed: [3], operation: 'S2 samples 7, 6, 9 → pivot 7', range: '4–8' }));
  [values[6], values[7]] = [values[7], values[6]];
  frames.push(frame('Recurse', 'Park 7. The local scans cross.', 'Park 7 at index 7. i stops at index 6 and j at index 5. They have crossed, so no scan-pair swap is needed.', row(values, { ...sortedRoles(4), 7: 'key', 6: 'compare', 5: 'compare' }, { 6: 'i', 5: 'j' }), { lanes: remaining, fixed: [3], operation: 'Inside S2: i = 6 > j = 5 → stop', range: '4–8' }));
  [values[6], values[7]] = [values[7], values[6]];
  frames.push(frame('Recurse', '7 is fixed between its two sides.', 'Swap A[i] with pivot 7. The remaining small ranges are [6, 5] and [8, 9]. Finish them with insertion sort.', row(values, { ...sortedRoles(4), 6: 'key', 7: 'shift' }), { fixed: [3, 6], range: '4–8', lanes: [lane('left','Finished',0,4/9,0.61),lane('small','Small range',4/9,6/9,0.61,'group'),lane('p','Fixed',6/9,7/9,0.61),lane('right','Small range',7/9,1,0.61,'group')] }));
  [values[4], values[5]] = [values[5], values[4]];
  frames.push(frame('Remember', 'Smaller problems finish the sort.', 'Insert 5 before 6. [8, 9] already needs no shifts. Every range is now sorted, and every pivot stayed fixed.', row(values, sortedRoles(9))));
  return arrayStory('quick', frames);
}

function shellFilm() {
  const values = [2, 1, 6, 3, 0, 5].map(item);
  const even = { 0: 'group', 2: 'group', 4: 'group' };
  const meta = { gap: 2, group: [0, 2, 4] };
  const frames = [frame('Groups', 'Two groups share one array', 'With gap 2, even indices form [2, 6, 0] and odd indices form [1, 3, 5]. Only the purple group is active.', row(values, even), meta)];
  frames.push(frame('Hold', 'Hold key 0 at index 4', 'i marks where this insertion began. j marks index 2, the next comparison. The held key compares with 6, two positions left.', row(values, { ...even, 4: 'key', 2: 'compare' }, { 4: 'i', 2: 'j' }), { ...meta, held: '0' }));
  [values[2], values[4]] = [values[4], values[2]];
  frames.push(frame('Shift', '6 goes right; the open slot goes left', 'Shift 6 from index 2 to index 4. Key 0 follows the new open slot at index 2; j moves to index 0.', row(values, { ...even, 2: 'key', 4: 'shift', 0: 'compare' }, { 4: 'i', 0: 'j' }), { ...meta, held: '0' }));
  [values[0], values[2]] = [values[2], values[0]];
  frames.push(frame('Shift', '2 goes right; key 0 reaches the front', 'Shift 2 from index 0 to index 2. There is no earlier index in this group. The odd-indexed values did not move.', row(values, { ...even, 0: 'key', 2: 'shift' }, { 4: 'i' }), { ...meta, held: '0' }));
  frames.push(frame('Insert', 'Insert 0 at index 0', 'The even group is now [0, 2, 6]. The odd group [1, 3, 5] was already ordered. The full array still contains 6 before 5.', row(values, even), meta));
  frames.push(frame('Gap one', 'Shrink the gap to 1', 'Every position now belongs to one group. The first five values form an ordered prefix; hold the final key 5 and compare with 6.', row(values, { ...sortedRoles(5), 5: 'key', 4: 'compare' }, { 5: 'i', 4: 'j' }), { gap: 1, group: [0, 1, 2, 3, 4, 5], held: '5' }));
  [values[4], values[5]] = [values[5], values[4]];
  frames.push(frame('Gap one', 'Shift 6 one slot right', 'Key 5 now follows the open slot at index 4. Compare with 3 at index 3; 3 is smaller, so stop shifting.', row(values, { ...sortedRoles(4), 4: 'key', 5: 'shift', 3: 'compare' }, { 5: 'i', 3: 'j' }), { gap: 1, group: [0, 1, 2, 3, 4, 5], held: '5' }));
  frames.push(frame('Remember', 'The gap controls the distance', 'Insert 5 after 3. Gap 2 ordered separate groups; gap 1 joined them into one sorted array.', row(values, sortedRoles(6))));
  return arrayStory('shell', frames);
}

function mergeFilm(tim = false) {
  const values = (tim ? [1, 4, 7, 2, 3, 6] : [7, 1, 4, 6, 2, 3]).map(item);
  let left = values.slice(0, 3), right = values.slice(3);
  let leftSorted = false, rightSorted = false, leftUsed = 0, rightUsed = 0;
  const output = Array(values.length).fill(null);
  const frames = [];
  const add = (chapter, title, caption, phase, operation, extra = {}) => {
    const tokens = [...left.map((v,i) => ({ ...v, x:(i + 0.5)/3, y:0.2, role:'neutral', index:String(i) })),
      ...right.map((v,i) => ({ ...v, x:(i + 0.5)/3, y:0.5, role:'neutral', index:String(i) }))]
      .filter(v => !output.some(o => o?.id === v.id));
    tokens.push(...output.flatMap((v,i) => v ? [{ ...v, x:(i + 0.5)/6, y:0.82, role:'sorted', index:String(i) }] : []));
    frames.push(frame(chapter, title, caption, tokens, { duration:4.8, operation, merge:{ phase, input:values.map(v => ({...v})), left:left.map(v => ({...v})), right:right.map(v => ({...v})), leftSorted, rightSorted, leftUsed, rightUsed, output:output.map(v => v ? {...v} : null), tim, ...extra } }));
  };
  add(tim ? 'Runs' : 'Split', tim ? 'Look for order already in the input.' : 'Start with one unsorted array.', tim
    ? 'Scan left to right. An ascending run can be reused instead of sorted from scratch.'
    : 'Split the array into two halves. Each half solves the same sorting problem on fewer values.', 'input', tim ? '1 ≤ 4 ≤ 7 · then 2 begins a new run' : '6 items → two halves of 3');
  if (!tim) {
    add('Split','Two halves. Neither is sorted yet.','The left half is [7, 1, 4]; the right half is [6, 2, 3]. Keep splitting each half.', 'split','Left [7, 1, 4] · right [6, 2, 3]');
    add('Split','Single values stop the recursion.','A range of size one is already sorted. Start merging these tiny ranges into larger sorted ranges.', 'singletons','[7] [1] [4]     [6] [2] [3]');
    add('Small merges','The left pair needs no exchange.','Compare 1 and 4. Their pair is already ordered. Now merge [7] with the sorted pair [1, 4].','left-pair','1 ≤ 4 → sorted pair [1, 4]');
    left = [...left].sort((a,b) => Number(a.value)-Number(b.value)); leftSorted = true;
    add('Small merges','The left half becomes [1, 4, 7].','Merge [7] and [1, 4]: take 1, then 4, then the remaining 7. Only the left half changes.','left-ready','Fronts 7 and 1 → take 1, then 4, then 7');
    add('Small merges','The right pair is already ordered.','Compare 2 and 3. Merge their sorted pair [2, 3] with [6]; the finished left half stays put.','right-pair','2 ≤ 3 → sorted pair [2, 3]');
    right = [...right].sort((a,b) => Number(a.value)-Number(b.value)); rightSorted = true;
    add('Small merges','The right half becomes [2, 3, 6].','Merge [6] and [2, 3]: take 2, then 3, then the remaining 6. Both halves are now sorted.','right-ready','Fronts 6 and 2 → take 2, then 3, then 6');
  } else {
    leftSorted = true;
    add('Runs','The first run is [1, 4, 7].','1 ≤ 4 ≤ 7, but 2 is smaller than 7, so it starts a new run. The first run is already sorted.','left-ready','1 ≤ 4 ≤ 7 · stop the first run before 2');
    rightSorted = true;
    add('Runs','The second run is [2, 3, 6].','2 ≤ 3 ≤ 6. This teaching example uses minimum run length 3, so neither run needs insertion-sort extension.','right-ready','2 ≤ 3 ≤ 6 · both runs are long enough');
  }
  add('Merge','Compare only the unused fronts.','Each source is sorted. Its front is its smallest unused value. Choose the smaller front to fill the next output slot.','merge','Left front 1 vs right front 2 → take 1');
  for (let target=0; target<output.length; target++) {
    const a=left[leftUsed], b=right[rightUsed];
    const source=!b || (a && Number(a.value)<=Number(b.value)) ? 'left' : 'right';
    const sourceIndex=source==='left' ? leftUsed++ : rightUsed++;
    const chosen=(source==='left' ? left : right)[sourceIndex];
    output[target]={...chosen};
    add('Merge',`Copy ${chosen.value} into output slot ${target}.`, a && b
      ? `Compare ${a.value} and ${b.value}. Copy the smaller front, ${chosen.value}, into slot ${target}. Advance only the ${source} pointer.`
      : `The ${source==='left' ? 'right' : 'left'} source is exhausted. Copy ${chosen.value} from the remaining source into slot ${target}.`,
      'place', a && b ? `${a.value} vs ${b.value} → ${chosen.value} goes to output[${target}]` : `One source exhausted → copy ${chosen.value} into output[${target}]`,
      {source,sourceIndex,target,chosenId:chosen.id,compared:[a?.id,b?.id].filter(Boolean)});
  }
  add('Remember',tim ? 'Reuse order. Merge the runs.' : 'Small sorted ranges build the whole.',tim
    ? 'This example needed a scan and one merge. Short runs would first be extended by insertion sort; production TimSort also balances its run stack.'
    : 'Every output slot is filled in order. Splitting reached simple base cases; merging built larger sorted ranges from them.', 'done','All 6 output slots are filled in sorted order');
  return frames;
}

function countingFilm() {
  const values = [2, 1, 2, 0, 3, 1].map(item);
  const counts = [0, 0, 0, 0];
  const output = Array(values.length).fill(null);
  const inputRow = () => values.map((v, i) => ({ ...v, x: (i + 0.5) / 6, y: 0.2, role: 'neutral', index: String(i) }));
  const buckets = () => counts.map((v, i) => ({ id: `bucket${i}`, value: String(v), x: (i + 1) / 5, y: 0.48, role: 'group', index: `value ${i}` }));
  let frequency, ends;
  const snapshot = (phase, action = {}) => ({
    phase, input: values.map(v => ({ ...v })), counts: [...counts],
    frequency: frequency ? [...frequency] : null, ends: ends ? [...ends] : null,
    output: output.map(v => v ? { ...v } : null), ...action,
  });
  const outputRow = () => output.flatMap((v, i) => v ? [{ ...v, x: (i + 0.5) / 6, y: 0.78, role: 'sorted', index: String(i) }] : []);
  const add = (chapter, title, caption, phase, action = {}) => frames.push(frame(chapter, title, caption,
    [...inputRow().filter(v => !output.some(o => o?.id === v.id)), ...buckets(), ...outputRow()],
    { duration: 4.2, counting: snapshot(phase, action) }));
  const frames = [];
  add('Set up', '6 items. 4 possible values.', 'The values run from 0 to 3. Create four zero-filled buckets, and six empty output slots.', 'setup');
  for (let i = 0; i < values.length; i++) {
    const v = Number(values[i].value), before = counts[v];
    counts[v]++;
    add('Count', `Read ${v}. Count one more ${v}.`, `Input index ${i} contains ${v}. Add one to bucket ${v}: ${before} → ${counts[v]}. The input stays unchanged.`, 'count', { activeInput: i, activeBucket: v, before, after: counts[v] });
  }
  frequency = [...counts];
  add('Count', 'Now we know how many of each.', 'One 0, two 1s, two 2s, and one 3. These are frequencies, not output indices.', 'frequencies');
  for (let v = 1; v < counts.length; v++) {
    const before = counts[v], addend = counts[v - 1];
    counts[v] += addend;
    add('Find ranges', `How many values are at most ${v}?`, `${before} value${before === 1 ? '' : 's'} equal ${v}, plus ${addend} smaller values. Total: ${counts[v]}. ${v}s belong at output indices ${addend}–${counts[v] - 1}.`, 'prefix', { activeBucket: v, before, addend, after: counts[v] });
  }
  ends = [...counts];
  add('Find ranges', 'Each value has its own output range.', 'The bucket numbers now count values up to each value. Subtract one to find the rightmost free slot in that range.', 'ranges');
  for (let i = values.length - 1; i >= 0; i--) {
    const chosen = values[i], v = Number(chosen.value), before = counts[v], target = --counts[v];
    output[target] = { ...chosen, sourceIndex: i };
    add('Place', `Copy ${v} into output slot ${target}.`, `Bucket ${v}: ${before} − 1 = ${target}. Copy input[${i}] there. Reading right to left keeps equal values in their original order.`, 'place', { activeInput: i, activeBucket: v, before, after: counts[v], target });
    frames.at(-1).duration = 4.8;
  }
  frames.push(frame('Remember', 'Count → find ranges → fill slots.', 'The output is sorted. The small i labels show where each copy came from: equal values kept their original order.', outputRow(), { duration: 4.8, counting: snapshot('done') }));
  return frames;
}

function inductionFilm() {
  const dots = (n) => Array.from({ length: n }, (_, r) => Array.from({ length: r + 1 }, (_, c) => ({ id: `d${r}-${c}`, value: '', x: 0.27 + c * 0.095, y: 0.24 + r * 0.13, role: 'sorted', small: true }))).flat();
  const equation = (value, role = 'neutral') => [text('equation', value, 0.5, 0.84, role, 0.9)];
  return [
    frame('Base', 'Check the first case', 'For n = 1, the sum is 1 and the formula gives 1 × 2 / 2 = 1. This is the base case.', dots(1), { texts: equation('1 = 1 × 2 / 2') }),
    frame('Assume', 'Assume the sum through k', 'Suppose the first k rows contain k(k + 1)/2 dots. This assumption will help prove the very next row.', dots(3), { texts: equation('1 + 2 + ··· + k = k(k + 1)/2', 'sorted') }),
    frame('Bridge', 'Add exactly one new row', 'To reach k + 1, keep the assumed sum and add a row of k + 1 dots. Here k = 3, so the new row has 4 dots.', dots(4).map(t => ({ ...t, role: t.id.startsWith('d3') ? 'key' : 'sorted' })), { texts: equation('k(k + 1)/2 + (k + 1)', 'key') }),
    frame('Bridge', 'Put both terms over 2', 'Rewrite the added row as 2(k + 1)/2. This gives a common denominator so the numerators can be added.', dots(4), { texts: equation('[k(k + 1) + 2(k + 1)] / 2', 'group') }),
    frame('Bridge', 'Factor the shared term', 'Both numerator terms contain k + 1. Factoring gives (k + 1)(k + 2)/2, the formula for the next case.', dots(4), { texts: equation('(k + 1)(k + 2) / 2', 'sorted') }),
    frame('Conclusion', 'The same bridge works for every k', 'The diagram illustrates the bridge at k = 3. The algebra proves P(k) implies P(k + 1) for every positive k; the base case starts the chain.', dots(4), { texts: equation('base case + P(k) ⇒ P(k + 1)', 'sorted') }),
  ];
}

function telescopingFilm(lower = 1, symbolic = false) {
  const fractions = Array.from({ length: 5 }, (_, i) => symbolic ? `F(${i + 1})` : lower + i === 1 ? '1' : `1/${lower + i}`);
  const terms = Array.from({ length: 4 }, (_, i) => [
    { id: `plus${i}`, value: `+${fractions[i]}`, fraction: symbolic ? undefined : { sign: '+', denominator: lower + i }, x: 0.30, y: 0.10 + i * 0.24, cellSize: 50, role: i === 0 ? 'sorted' : 'key' },
    { id: `minus${i}`, value: `−${fractions[i + 1]}`, fraction: symbolic ? undefined : { sign: '−', denominator: lower + i + 1 }, x: 0.70, y: 0.10 + i * 0.24, cellSize: 50, role: i === 3 ? 'sorted' : 'shift' },
  ]).flat();
  const frames = [frame('Rewrite', symbolic ? 'Write consecutive differences' : 'Turn a product into a difference', symbolic ? 'Write F(1) − F(2), then F(2) − F(3), and continue. Each negative value has a positive partner in the next row.' : `1/[k(k + 1)] = 1/k − 1/(k + 1). These four rows use k = ${lower} through ${lower + 3}. Each row is one term of the sum.`, terms)];
  const removed = new Set();
  for (let i = 0; i < 3; i++) {
    removed.add(`minus${i}`); removed.add(`plus${i + 1}`);
    frames.push(frame('Cancel', `${fractions[i + 1]} cancels its opposite`, `The negative ${fractions[i + 1]} in one row and positive ${fractions[i + 1]} in the next add to zero. Both signs matter.`, terms.map(t => ({ ...t, opacity: removed.has(t.id) ? 0.40 : 1, cancelled: removed.has(t.id), role: t.id === `minus${i}` || t.id === `plus${i + 1}` ? 'group' : t.role })), { links: [{ from: `minus${i}`, to: `plus${i + 1}`, role: 'group', curved: true }] }));
  }
  frames.push(frame('Endpoints', 'Only the endpoints survive', symbolic ? 'Keep the first positive F(1) and last negative F(5). For bounds a through b, the general result is F(a) − F(b + 1).' : lower === 1 ? 'For four terms, keep 1 − 1/5 = 4/5. For n terms starting at 1, the same cancellation leaves 1 − 1/(n + 1).' : `The sum starts at k = ${lower}, so keep 1/${lower} − 1/${lower + 4}. For k = 3 through 6, that is 4/21. The lower bound changes the first endpoint.`, terms.filter(t => t.id === 'plus0' || t.id === 'minus3').map(t => ({ ...t, y: 0.38 })), { texts: [text('general', symbolic ? 'F(a) − F(b + 1)' : lower === 1 ? '1 − 1/(n + 1) = n/(n + 1)' : '1/3 − 1/7 = 4/21', 0.5, 0.78, 'sorted', 0.85)] }));
  return frames;
}

function masterFilm(power = 1) {
  const labels = power === 0 ? ['1', '2', '4', '8'] : power === 1 ? ['8', '8', '8', '8'] : ['64', '32', '16', '8'];
  const tokens = [], links = [], frames = [];
  for (let level = 0; level < 4; level++) {
    for (let i = 0; i < 2 ** level; i++) {
      const id = `tree${level}-${i}`;
      tokens.push({ id, value: String(8 / 2 ** level), x: (i + 0.5) / 2 ** level, y: 0.14 + level * 0.19, role: 'key', cellSize: 40, small: level === 3 });
      if (level) links.push({ from: `tree${level - 1}-${Math.floor(i / 2)}`, to: id, role: 'neutral' });
    }
    frames.push(frame('Levels', level === 0 ? 'Read the recurrence' : `Level ${level}: ${2 ** level} subproblems`, level === 0
      ? `T(n) = 2T(n/2) + ${power === 0 ? '1' : power === 1 ? 'n' : 'n²'}. Each node labels its input size; the outside work is counted separately.`
      : `${2 ** level} nodes each handle size ${8 / 2 ** level}. Their combined outside work is ${labels[level]} for this n = 8 example.`, structuredClone(tokens), { links: structuredClone(links), texts: labels.slice(0, level + 1).map((v, i) => text(`cost${i}`, `work ${v}`, 1.08, 0.14 + i * 0.19, 'shift', 0.6)), diagramWidth: 0.8 }));
  }
  const result = power === 0 ? 'Θ(n)' : power === 1 ? 'Θ(n log n)' : 'Θ(n²)';
  frames.push(frame('Total', power === 0 ? 'The leaves dominate' : power === 1 ? 'Equal work at each level' : 'The root dominates', power === 0
    ? 'Work doubles by level: 1 + 2 + 4 + 8. In general the geometric sum is Θ(n), the basic Master theorem case 1.'
    : power === 1 ? 'Every level does n work and there are log₂ n + 1 levels. Total work is Θ(n log n), the basic Master theorem case 2.'
      : 'Work halves by level: 64 + 32 + 16 + 8. The geometric sum is Θ(n²), the basic Master theorem case 3.', tokens.map(t => ({ ...t, role: 'sorted' })), { links, texts: [text('total', result, 0.5, 0.94, 'sorted', 1.1)] }));
  return frames;
}

function timeFilm() {
  const dots = [];
  const frames = [frame('Count', 'Count one comparison', 'Selection sort checks every value after the boundary. For n = 5, the first pass makes four comparisons.', [], { texts: [text('rule', 'count the comparisons, not the seconds', 0.5, 0.44, 'key', 0.85)] })];
  for (let pass = 0; pass < 4; pass++) {
    for (let c = 0; c < 4 - pass; c++) dots.push({ id: `check${pass}-${c}`, value: '', x: 0.28 + c * 0.13, y: 0.22 + pass * 0.16, role: 'compare', small: true });
    frames.push(frame('Sum', `Pass ${pass + 1} adds ${4 - pass} comparisons`, `The boundary advances, so one fewer value remains to check. So far: ${[4, 3, 2, 1].slice(0, pass + 1).join(' + ')} comparisons.`, structuredClone(dots), { texts: [text('total', `${[4, 3, 2, 1].slice(0, pass + 1).reduce((a, b) => a + b, 0)} comparisons`, 0.5, 0.94, 'compare', 0.8)] }));
  }
  frames.push(frame('Growth', 'The triangle grows quadratically', 'In general, (n − 1) + ··· + 1 = n(n − 1)/2. The dominant term is n², so selection makes Θ(n²) comparisons.', dots, { texts: [text('formula', 'n(n − 1)/2 = ½n² − ½n', 0.5, 0.94, 'group', 0.85)] }));
  frames.push(frame('Cases', 'Input cases and bounds answer different questions', 'Selection still scans sorted input. Best, average, and worst cases all have Θ(n²) comparisons. O, Ω, and Θ describe bounds on growth.', dots.map(t => ({ ...t, role: 'sorted' })), { texts: [text('cases', 'best = average = worst: Θ(n²)', 0.5, 0.94, 'sorted', 0.85)] }));
  return frames;
}

function spaceFilm() {
  const values = [4, 1, 3, 2].map(item);
  const base = row(values, {}, {}, 0.25);
  return [
    frame('Input', 'Separate the input from extra memory', 'These four input cells already exist. Auxiliary space counts only the extra storage an algorithm needs while it works.', base, { texts: [text('input', 'input array: n cells', 0.5, 0.47, 'neutral', 0.8)] }),
    frame('Key', 'Insertion sort holds one key', 'One held key and a fixed number of indices are enough. This extra storage stays constant as the input grows: Θ(1).', [...base, { id: 'key', value: '1', x: 0.5, y: 0.72, role: 'key' }], { texts: [text('extra', 'one key + a few indices', 0.5, 0.94, 'key', 0.75)] }),
    frame('Buffer', 'Merge sort uses a growing buffer', 'An efficient array merge uses a buffer proportional to the input length. A larger input needs a larger buffer: Θ(n) auxiliary space.', [...base, ...values.map((v, i) => ({ ...v, id: `buffer${i}`, x: (i + 0.5) / 4, y: 0.72, role: 'group' }))], { texts: [text('extra', 'temporary buffer: n cells', 0.5, 0.94, 'group', 0.75)] }),
    frame('Peak', 'Count what is alive at the same time', 'Reusing one buffer for successive merges uses n extra cells, not a new permanent buffer per step. Count peak live storage.', [...base, ...values.map((v, i) => ({ ...v, id: `buffer${i}`, x: (i + 0.5) / 4, y: 0.72, role: 'sorted' }))], { texts: [text('extra', 'reused buffer: still Θ(n)', 0.5, 0.94, 'sorted', 0.75)] }),
  ];
}

const film = (id, title, takeaway, frames, connections, note = '') => ({ id, title, takeaway, frames, connections, note,
  duration: frames.reduce((sum, scene) => sum + scene.duration, 0),
});

export const playFilms = {
  selection: film('selection', 'Scan first. Place once.', 'The minimum changes in your memory before anything moves in the array.', selectionFilm(), [
    { title: 'Why the scans form n²', href: '#/complexity/time' }, { title: 'Follow every comparison', href: '#/algorithms/selection/walkthrough' }]),
  insertion: film('insertion', 'Give the key a place.', 'Larger values shift right while the held key finds its place to the left.', insertionFilm(), [
    { title: 'Why the prefix stays sorted', href: '#/discrete/induction' }, { title: 'Compare input cases', href: '#/algorithms/insertion/growth' }], 'The blue key follows the open slot visually. The implementation holds it separately until insertion.'),
  shell: film('shell', 'Follow one gap-group.', 'A key moves left by the gap. It never jumps into a different group during that pass.', shellFilm(), [
    { title: 'Recognize ordinary insertion', href: '#/algorithms/insertion/play' }, { title: 'Why gap choice matters', href: '#/algorithms/shell/complexity' }], 'Gap sequence: 2, 1. The blue held key follows the open slot; code stores it separately.'),
  quick: film('quick', 'Fix a pivot. Shrink the problem.', 'A partition fixes its pivot. The unsorted sides become smaller independent problems.', quickFilm(), [
    { title: 'Read the balanced recursion tree', href: '#/discrete/master-theorem' }, { title: 'Follow the scans yourself', href: '#/algorithms/quick/walkthrough' }], 'Median of three; insertion cutoff of 4. Group color marks membership, not proof that the group is sorted.'),
  merge: film('merge', 'Take the smaller front.', 'Two sorted runs let you choose the next output value with one front comparison.', mergeFilm(), [
    { title: 'Why merging costs n per level', href: '#/discrete/master-theorem' }, { title: 'Where the buffer lives', href: '#/complexity/space' }]),
  tim: film('tim', 'Notice the order already there.', 'Reuse ordered runs, extend short ones when necessary, then merge.', mergeFilm(true), [
    { title: 'See how merging works', href: '#/algorithms/merge/play' }, { title: 'Explore the full teaching trace', href: '#/algorithms/tim/walkthrough' }], 'This film isolates existing runs using minimum length 3. The walkthrough includes short-run extension; production TimSort also balances its run stack.'),
  counting: film('counting', 'A value points to a bucket.', 'n counts input items. k counts possible integers in the inclusive value range.', countingFilm(), [
    { title: 'Understand n + k work', href: '#/algorithms/counting/complexity' }, { title: 'Count the extra storage', href: '#/complexity/space' }]),
  induction: film('induction', 'See the bridge to the next case.', 'Use the assumption at k to prove the next case, then let the base case start the chain.', inductionFilm(), [
    { title: 'Use this idea on a sorted prefix', href: '#/algorithms/insertion/understand' }, { title: 'Follow the complete proof', href: '#/discrete/induction' }]),
  telescoping: film('telescoping', 'Watch the middle disappear.', 'Opposite copies cancel in pairs. The endpoints determine the sum.', telescopingFilm(), [
    { title: 'Connect sums to operation counts', href: '#/complexity/time' }, { title: 'Explore the general identity', href: '#/discrete/telescoping' }]),
  master: film('master', 'Count the work across a tree.', 'Count the work at each level, then add the levels.', masterFilm(), [
    { title: 'Watch the actual merges', href: '#/algorithms/merge/play' }, { title: 'Connect the tree to growth', href: '#/algorithms/merge/growth' }]),
  time: film('time', 'Turn the scans into a sum.', 'Selection’s shrinking scans make a triangle of comparisons.', timeFilm(), [
    { title: 'Watch selection’s scan', href: '#/algorithms/selection/play' }, { title: 'Change the input size', href: '#/algorithms/selection/growth' }]),
  space: film('space', 'Count what stays alive.', 'Input storage and auxiliary storage answer different questions.', spaceFilm(), [
    { title: 'See the single held key', href: '#/algorithms/insertion/play' }, { title: 'See merge’s output grow', href: '#/algorithms/merge/play' }]),
};

export const masterVariants = [
  { id: 'master', label: 'Equal levels: + n', film: playFilms.master },
  { id: 'master-leaves', label: 'Leaves dominate: + 1', film: film('master-leaves', 'The leaves dominate.', 'The work doubles at successive levels.', masterFilm(0), playFilms.master.connections) },
  { id: 'master-root', label: 'Root dominates: + n²', film: film('master-root', 'The root dominates.', 'The work halves at successive levels.', masterFilm(2), playFilms.master.connections) },
];

function powersFilm() {
  const frames = Array.from({ length: 5 }, (_, exponent) => frame(exponent === 0 ? 'Base' : 'Examples', exponent === 0 ? 'Start where both sides are 1' : `At n = ${exponent}, compare both sides`, `2 to the power ${exponent} is ${2 ** exponent}. The bound n + 1 is ${exponent + 1}. These examples illustrate the claim; the next scene gives the general bridge.`, [
    { id: 'power', value: String(2 ** exponent), x: 0.3, y: 0.42, role: 'key' },
    { id: 'bound', value: String(exponent + 1), x: 0.7, y: 0.42, role: 'sorted' },
  ], { texts: [text('power-label', '2ⁿ', 0.3, 0.16, 'key'), text('bound-label', 'n + 1', 0.7, 0.16, 'sorted'), text('comparison', '≥', 0.5, 0.42, 'neutral', 1.4)] }));
  frames.push(frame('Bridge', 'Prove the arbitrary next case', 'Assume 2ᵏ ≥ k + 1 for k ≥ 0. Multiply by 2: 2ᵏ⁺¹ ≥ 2(k + 1) ≥ k + 2. With the base case, this proves the claim for all n ≥ 0.', [], { texts: [text('hypothesis', '2ᵏ ≥ k + 1', 0.5, 0.22, 'key'), text('bridge', '2ᵏ⁺¹ ≥ 2(k + 1) ≥ k + 2', 0.5, 0.56, 'sorted', 0.85)] }));
  return frames;
}

function prefixProofFilm() {
  const values = [4, 7, 8, 2].map(item);
  let ordered = [...values];
  const frames = [frame('Base', 'One value is already sorted', 'The first value forms a sorted prefix. This is the base case for the loop invariant.', row(ordered, { 0: 'sorted' }))];
  frames.push(frame('Assume', 'Assume a sorted prefix of size k', 'Here k = 3: 4, 7, and 8 are sorted. The next key is 2. Assume the old prefix is sorted; do not assume the enlarged one is.', row(ordered, { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'key' })));
  for (let slot = 3; slot > 0; slot--) {
    [ordered[slot], ordered[slot - 1]] = [ordered[slot - 1], ordered[slot]];
    frames.push(frame('Preserve', `Move ${ordered[slot].value} right`, `The prefix value ${ordered[slot].value} exceeds key 2, so it shifts right. The key is drawn in the open slot to make its destination clear.`, row(ordered, Object.fromEntries(ordered.map((value, index) => [index, index === slot - 1 ? 'key' : index === slot ? 'shift' : 'sorted'])))));
  }
  frames.push(frame('Conclude', 'The prefix grows by one', 'Insert 2 at the front. The first k + 1 values are now sorted. The same preservation step works for every iteration, until the prefix is the entire input.', row(ordered, { 0: 'sorted', 1: 'sorted', 2: 'sorted', 3: 'sorted' })));
  return frames;
}

function halvingFilm() {
  const frames = [16, 8, 4, 2, 1].map((size, count) => frame('Halve', count === 0 ? 'Start with size n' : `Halving ${count}: size ${size}`, count === 0 ? 'For this example, n = 16. Repeatedly divide the current size by 2 until it reaches 1.' : `One more constant-cost division halves the remaining size. After ${count} divisions, it is ${size}.`, [{ id: 'size', value: String(size), x: 0.5, y: 0.38, role: 'key' }], { texts: [text('count', `${count} divisions so far`, 0.5, 0.75, 'compare', 0.85)] }));
  frames.push(frame('Growth', 'Doubling the input adds one halving', 'n = 16 needs 4 halvings; n = 32 needs 5. After t halvings the size is about n/2ᵗ, so reaching 1 takes Θ(log n) steps.', [], { texts: [text('rule', 'n / 2ᵗ ≈ 1', 0.5, 0.25, 'key'), text('result', 't ≈ log₂ n', 0.5, 0.6, 'sorted', 1.2)] }));
  return frames;
}

function consecutiveFilm() {
  const cells = Array.from({ length: 8 }, (_, i) => ({ id: `loop${i}`, value: '', x: 0.25 + (i % 4) * 0.16, y: i < 4 ? 0.3 : 0.65, role: 'neutral' }));
  const labels = [text('first', 'first loop', 0.5, 0.05, 'key', 0.75), text('second', 'second loop', 0.5, 0.91, 'group', 0.75)];
  return [frame('First', 'A loop visits n values', 'For n = 4, the first loop performs four constant-cost actions.', cells.map((t, i) => ({ ...t, role: i < 4 ? 'key' : 'neutral' })), { texts: labels }),
    frame('Second', 'Then another loop visits n values', 'The second loop runs after the first, not inside it. It adds four actions; it does not repeat four times for every earlier action.', cells.map((t, i) => ({ ...t, role: i < 4 ? 'key' : 'group' })), { texts: labels }),
    frame('Total', 'Add phases; do not multiply them', 'At n = 4, the total is 4 + 4 = 8. In general, n + n = 2n, so consecutive linear loops have Θ(n) total work.', cells.map(t => ({ ...t, role: 'sorted' })), { texts: [text('total', 'n + n = 2n → Θ(n)', 0.5, 0.93, 'sorted', 0.8)] })];
}

function stackFilm(unbalanced = false) {
  const sizes = unbalanced ? [5, 4, 3, 2, 1] : [8, 4, 2, 1];
  const frames = sizes.map((size, depth) => frame('Call', `Depth ${depth + 1}: input size ${size}`, unbalanced ? `This call reduces the size by only one. The earlier calls remain active while it works, so ${depth + 1} frames are live.` : `Each recursive child halves the input. Its ancestors remain active, so ${depth + 1} frames are live on this one chain. Siblings are not all on the stack at once.`, sizes.slice(0, depth + 1).map((value, i) => ({ id: `call${i}`, value: String(value), x: 0.5, y: 0.12 + i * 0.145, role: i === depth ? 'key' : 'group', small: true })), { texts: [text('label', 'one active call chain', 0.5, 0.95, 'neutral', 0.75)] }));
  frames.push(frame('Return', 'Returning releases the frames', 'As each call returns, its stack frame can be released. Space is the deepest active chain, not all calls added together.', [{ id: 'call0', value: String(sizes[0]), x: 0.5, y: 0.12, role: 'sorted' }], { texts: [text('result', unbalanced ? 'one-at-a-time shrinking → Θ(n) depth' : 'halving the size → Θ(log n) depth', 0.5, 0.58, 'sorted', 0.85)] }));
  return frames;
}

export const conceptVariants = {
  master: masterVariants,
  induction: [
    { id:'induction', label:'Sum · add the next row', film:playFilms.induction },
    { id:'induction-powers', label:'Inequality · powers of two', film:film('induction-powers', 'Grow both sides of an inequality.', 'The bridge proves every case; checking examples alone does not.', powersFilm(), playFilms.induction.connections) },
    { id:'induction-prefix', label:'Invariant · a sorted prefix', film:film('induction-prefix', 'Preserve a sorted prefix.', 'An algorithm invariant uses the same base-and-bridge structure.', prefixProofFilm(), playFilms.induction.connections, 'The key is shown in the open slot; the implementation holds it separately.') },
  ],
  telescoping: [
    { id:'telescoping', label:'Start at 1 · four terms', film:playFilms.telescoping },
    { id:'telescoping-offset', label:'Start at 3 · different endpoints', film:film('telescoping-offset', 'Change the starting point.', 'The lower bound changes the first surviving positive term.', telescopingFilm(3), playFilms.telescoping.connections) },
    { id:'telescoping-pattern', label:'General pattern · F(k)', film:film('telescoping-pattern', 'See the cancellation structure.', 'The same matching rule works for any valid sequence of differences.', telescopingFilm(1, true), playFilms.telescoping.connections) },
  ],
  time: [
    { id:'time', label:'Shrinking scans · quadratic', film:playFilms.time },
    { id:'time-halving', label:'Halving loop · logarithmic', film:film('time-halving', 'Count the halvings.', 'Doubling n adds one iteration instead of doubling the work.', halvingFilm(), playFilms.time.connections) },
    { id:'time-consecutive', label:'Consecutive loops · linear', film:film('time-consecutive', 'Add the work of phases.', 'Two consecutive linear loops stay linear.', consecutiveFilm(), playFilms.time.connections) },
  ],
  space: [
    { id:'space', label:'Held key vs. reusable buffer', film:playFilms.space },
    { id:'space-balanced', label:'Balanced recursion · short stack', film:film('space-balanced', 'Watch one active call chain.', 'A halving chain uses Θ(log n) simultaneous stack frames.', stackFilm(), playFilms.space.connections) },
    { id:'space-unbalanced', label:'Unbalanced recursion · deep stack', film:film('space-unbalanced', 'Watch the chain grow longer.', 'Shrinking by one can keep Θ(n) stack frames alive.', stackFilm(true), playFilms.space.connections) },
  ],
};

export const conceptLegends = {
  selection: [['key','Smallest found'],['compare','Value being checked'],['shift','Swap in progress'],['sorted','Fixed prefix'],['group','i / j pointers']],
  insertion: [['key','Held key'],['compare','Compare to the left'],['shift','Value moving right'],['sorted','Completed prefix'],['group','i / j pointers']],
  shell: [['group','Active gap group / pointers'],['key','Held key'],['compare','Next comparison'],['shift','Value moving right'],['sorted','Completed insertion']],
  quick: [['key','Current pivot'],['compare','Stopped scan values'],['shift','Swap in progress'],['group','Unsorted ranges / pointers'],['sorted','Fixed / finished']],
  merge: [['group','Halves / pointers'],['compare','Unused fronts'],['key','Copy into output'],['sorted','Sorted ranges / output']],
  tim: [['group','Runs / pointers'],['compare','Unused fronts'],['key','Copy into output'],['sorted','Verified runs / output']],
  counting: [['compare','Reading input'],['key','Active bucket / copy path'],['group','Output range'],['sorted','Written output']],
  induction: [['sorted','Assumed / established'],['key','New case or term'],['group','Algebraic bridge']],
  telescoping: [['key','Positive term'],['shift','Negative term'],['group','Matching opposite pair'],['sorted','Surviving endpoint']],
  master: [['key','Subproblem input size'],['shift','Work at this level'],['sorted','Total growth']],
  time: [['key','Input / first phase'],['compare','Counted operation'],['group','Second phase / formula'],['sorted','Total growth']],
  space: [['neutral','Input storage'],['key','Current key / call'],['group','Extra storage / active frames'],['sorted','Retained or reused storage']],
};

export function sceneAt(film, seconds) {
  let start = 0;
  for (let index = 0; index < film.frames.length; index++) {
    const scene = film.frames[index];
    if (seconds < start + scene.duration || index === film.frames.length - 1) {
      return { scene, previous: film.frames[Math.max(0, index - 1)], index, start, local: Math.max(0, seconds - start) };
    }
    start += scene.duration;
  }
}

export function chaptersFor(film) {
  let time = 0;
  return film.frames.flatMap((scene, index) => {
    const result = !index || scene.chapter !== film.frames[index - 1].chapter ? [{ title: scene.chapter, time }] : [];
    time += scene.duration;
    return result;
  });
}
