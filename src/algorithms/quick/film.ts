import { arrayStory } from '../play/story.ts';
import { item, row, frame, lane, sortedRoles, film } from '../../shared/playback/model.ts';

function quickFilm() {
  const values = [4, 7, 8, 2, 9, 5, 6, 3, 1].map(item);
  const frames = [
    frame(
      'Pivot',
      'Choose the middle sample value.',
      'Sample the left, center, and right: 4, 9, and 1. Their median is 4. First, order those samples.',
      row(values, { 0: 'compare', 4: 'compare', 8: 'compare' }),
      { operation: 'Samples 4, 9, 1 → pivot value 4' },
    ),
  ];
  [values[0], values[8]] = [values[8], values[0]];
  frames.push(
    frame(
      'Pivot',
      'Put the smallest sample on the left.',
      'Swap 4 and 1. Only these two values move. The chosen pivot value is still 4.',
      row(values, { 8: 'key', 0: 'shift' }),
    ),
  );
  [values[4], values[8]] = [values[8], values[4]];
  frames.push(
    frame(
      'Pivot',
      'Put 4 between the other samples.',
      'Swap 9 and 4. The samples are now 1, 4, and 9; pivot 4 is at the center.',
      row(values, { 4: 'key', 8: 'shift' }),
    ),
  );
  [values[4], values[7]] = [values[7], values[4]];
  frames.push(
    frame(
      'Partition',
      'Park 4. Find two misplaced values.',
      'Park pivot 4 at index 7. i stops at 7, which is too large. j stops at 3, which is too small.',
      row(values, { 7: 'key', 1: 'compare', 4: 'compare' }, { 1: 'i', 4: 'j' }),
      { operation: 'i finds 7 > 4 · j finds 3 < 4' },
    ),
  );
  [values[1], values[4]] = [values[4], values[1]];
  frames.push(
    frame(
      'Partition',
      'Swap 7 and 3.',
      '7 belongs on the right of the pivot; 3 belongs on the left. Swap them. Pivot 4 stays parked.',
      row(values, { 7: 'key', 1: 'shift', 4: 'shift' }, { 1: 'i', 4: 'j' }),
    ),
  );
  frames.push(
    frame(
      'Partition',
      'Keep scanning toward the middle.',
      'The next stopped values are 8 and 2. Again, the large value is on the left and the small value is on the right.',
      row(values, { 7: 'key', 2: 'compare', 3: 'compare' }, { 2: 'i', 3: 'j' }),
      { operation: 'i finds 8 > 4 · j finds 2 < 4' },
    ),
  );
  [values[2], values[3]] = [values[3], values[2]];
  frames.push(
    frame(
      'Partition',
      'Swap 8 and 2.',
      'Move 2 left and 8 right. Then advance i and retreat j to look for the next pair.',
      row(values, { 7: 'key', 2: 'shift', 3: 'shift' }, { 2: 'i', 3: 'j' }),
    ),
  );
  frames.push(
    frame(
      'Partition',
      'The scans have crossed. Stop.',
      'i is now 3 and j is 2. There is no stopped pair left to exchange. The pivot can take its final position.',
      row(values, { 7: 'key', 3: 'compare', 2: 'compare' }, { 3: 'i', 2: 'j' }),
      { operation: 'i = 3 > j = 2 → stop scanning' },
    ),
  );
  [values[3], values[7]] = [values[7], values[3]];
  const split = [
    lane('s1', 'S1 · unsorted', 0, 3 / 9, 0.61, 'group'),
    lane('p', 'Fixed', 3 / 9, 4 / 9, 0.61, 'sorted'),
    lane('s2', 'S2 · unsorted', 4 / 9, 1, 0.61, 'group'),
  ];
  frames.push(
    frame(
      'Recurse',
      '4 is fixed. Each side is a new problem.',
      'Swap pivot 4 with A[i]. Every value on the left is smaller; every value on the right is larger. The sides still need sorting.',
      row(values, { 3: 'key', 7: 'shift' }),
      { lanes: split, fixed: [3] },
    ),
  );
  [values[1], values[2]] = [values[2], values[1]];
  const remaining = [
    lane('left', 'Finished', 0, 4 / 9, 0.61, 'sorted'),
    lane('s2', 'S2 · unsorted', 4 / 9, 1, 0.61, 'group'),
  ];
  frames.push(
    frame(
      'Recurse',
      'Finish the small left side.',
      'S1 has only three values. Insertion sort moves 2 before 3. Pivot 4 stays fixed; we can now focus on S2.',
      row(values, { ...sortedRoles(4) }),
      { lanes: remaining, fixed: [3], operation: 'Small S1 → insertion sort · swap 3 and 2', range: '0–2' },
    ),
  );
  [values[4], values[6]] = [values[6], values[4]];
  frames.push(
    frame(
      'Recurse',
      'Choose 7 inside the right side.',
      'S2 has five values, so partition again. Its samples are 7, 6, and 9. Order them; their median is 7.',
      row(values, { ...sortedRoles(4), 6: 'key', 4: 'shift' }),
      { lanes: remaining, fixed: [3], operation: 'S2 samples 7, 6, 9 → pivot 7', range: '4–8' },
    ),
  );
  [values[6], values[7]] = [values[7], values[6]];
  frames.push(
    frame(
      'Recurse',
      'Park 7. The local scans cross.',
      'Park 7 at index 7. i stops at index 6 and j at index 5. They have crossed, so no scan-pair swap is needed.',
      row(values, { ...sortedRoles(4), 7: 'key', 6: 'compare', 5: 'compare' }, { 6: 'i', 5: 'j' }),
      { lanes: remaining, fixed: [3], operation: 'Inside S2: i = 6 > j = 5 → stop', range: '4–8' },
    ),
  );
  [values[6], values[7]] = [values[7], values[6]];
  frames.push(
    frame(
      'Recurse',
      '7 is fixed between its two sides.',
      'Swap A[i] with pivot 7. The remaining small ranges are [6, 5] and [8, 9]. Finish them with insertion sort.',
      row(values, { ...sortedRoles(4), 6: 'key', 7: 'shift' }),
      {
        fixed: [3, 6],
        range: '4–8',
        lanes: [
          lane('left', 'Finished', 0, 4 / 9, 0.61),
          lane('small', 'Small range', 4 / 9, 6 / 9, 0.61, 'group'),
          lane('p', 'Fixed', 6 / 9, 7 / 9, 0.61),
          lane('right', 'Small range', 7 / 9, 1, 0.61, 'group'),
        ],
      },
    ),
  );
  [values[4], values[5]] = [values[5], values[4]];
  frames.push(
    frame(
      'Remember',
      'Smaller problems finish the sort.',
      'Insert 5 before 6. [8, 9] already needs no shifts. Every range is now sorted, and every pivot stayed fixed.',
      row(values, sortedRoles(9)),
    ),
  );
  return arrayStory('quick', frames);
}

export const playFilms = {
  quick: film(
    'quick',
    'Fix a pivot. Shrink the problem.',
    'A partition fixes its pivot. The unsorted sides become smaller independent problems.',
    quickFilm(),
    [
      { title: 'Read the balanced recursion tree', href: '#/discrete/master-theorem' },
      { title: 'Follow the scans yourself', href: '#/algorithms/quick/walkthrough' },
    ],
    'Median of three; insertion cutoff of 4. Group color marks membership, not proof that the group is sorted.',
  ),
};
export const legend = [
  ['key', 'Current pivot'],
  ['compare', 'Stopped scan values'],
  ['shift', 'Swap in progress'],
  ['group', 'Unsorted ranges / pointers'],
  ['sorted', 'Fixed / finished'],
];
