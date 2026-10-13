import { lesson } from './lesson.ts';
const make = (...args: Parameters<typeof lesson> extends [string, ...infer Rest] ? Rest : never) =>
  lesson('prefix-sum', ...args);
export const lessons = [
  make(
    'Count Vowels in Substrings',
    'Store a prefix count and subtract two boundaries for each substring query.',
    'prefix[i] counts vowels in the first i characters.',
    '"apple", query inclusive indices 1 through 4',
    [
      'prefix = [0,1,1,1,1,2] :: The empty prefix starts at zero.',
      'query [1,4] → prefix[5] − prefix[1] :: Include the right endpoint by adding one.',
      'answer = 2 − 1 = 1 :: Only e lies inside the queried substring.',
    ],
    'O(n) preprocessing; O(1) per query',
    'O(n)',
    'This lesson counts vowel characters; counting words that begin/end with vowels uses a different indicator per word.',
    'Which formula answers an inclusive [l,r] query?',
    ['prefix[r+1] − prefix[l]', 'prefix[r] − prefix[l]', 'prefix[r+1] + prefix[l]'],
    'Prefixes use exclusive endpoints.',
  ),
  make(
    'Subarray Sum Equals K',
    'Count earlier prefix sums equal to current prefix minus k.',
    'The frequency map contains only prefixes before the current endpoint.',
    '[1,−1,1], k = 1',
    [
      'counts {0:1}; prefix 1 → one match :: The empty prefix permits a subarray starting at zero.',
      'prefix 0 → no earlier −1 match :: Record this second occurrence of prefix zero.',
      'prefix 1 → two earlier zero matches :: Total three subarrays sum to 1.',
    ],
    'O(n) expected',
    'O(n)',
    'Update the answer before inserting the current prefix, especially when k=0; negative values defeat simple sum windows.',
    'Why start with prefix zero occurring once?',
    [
      'To count ranges beginning at index zero',
      'To count an empty subarray as every answer',
      'To remove negative values',
    ],
    'Subtracting the empty prefix gives the sum of the entire first segment.',
  ),
];
