import { bubbleTrace, shellCodeTrace } from './adjacent.ts';
import { mergeCodeTrace, timCodeTrace } from './merge.ts';
export const sortingLabs = {
  bubble: {
    title: 'Bubble sort · adjacent decisions',
    intro:
      'Watch one adjacent comparison at a time. A completed pass fixes the largest remaining value; a pass without swaps ends early.',
    input: '8, 3, 6, 2, 5',
    build: bubbleTrace,
  },
  shell: {
    title: 'Shell sort · follow the gap groups',
    intro:
      'Keep the key outside the array while larger values shift. A gap group is not a contiguous block. Compare two gap sequences on the same input.',
    input: '8, 3, 6, 2, 5, 1, 7',
    variants: [
      { id: 'halving', label: 'Halving gaps' },
      { id: 'knuth', label: 'Knuth gaps' },
    ],
    build: shellCodeTrace,
  },
  merge: {
    title: 'Merge sort · split, return, combine',
    intro:
      'Follow the call stack down to the base cases, then watch the two sorted buffers feed one output. Identity labels reveal stability.',
    input: '8, 3, 6, 3, 5',
    build: mergeCodeTrace,
  },
  tim: {
    title: 'TimSort · natural runs before merging',
    intro:
      'Discover order already present in the input. Reverse strict descending runs, extend short runs, then combine neighboring runs.',
    input: '8, 6, 3, 2, 5, 7, 1',
    build: timCodeTrace,
  },
};
