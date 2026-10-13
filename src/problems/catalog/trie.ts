import { lesson } from './lesson.ts';
const make = (...args: Parameters<typeof lesson> extends [string, ...infer Rest] ? Rest : never) =>
  lesson('trie', ...args);
export const lessons = [
  make(
    'Implement Trie Methods',
    'Insert characters along edges and mark a terminal node for each complete word.',
    'A path records a prefix; only a terminal marker records an inserted full word.',
    'Insert "car" and "cart"',
    [
      'root → c → a → r :: Share the common prefix.',
      'mark r terminal; add t terminal :: car remains a complete word after cart is inserted.',
      'search "ca" false; startsWith "ca" true :: Existing path and complete word are different tests.',
    ],
    'O(L) per insertion/search for word length L',
    'O(total inserted characters) upper bound',
    'Do not infer a complete word merely because its path exists.',
    'What distinguishes search from startsWith?',
    ['Search also requires a terminal marker', 'Search ignores characters', 'startsWith requires a longer word'],
    'Prefix existence alone does not establish exact word membership.',
  ),
  make(
    'Prefix Matching',
    'Walk to the prefix node, then traverse its descendants to collect matching words.',
    'Every descendant completion extends the requested prefix.',
    'Words "car", "cart", "cat"; prefix "car"',
    [
      'follow c → a → r :: Locate the subtree representing the prefix.',
      'r is terminal → include car :: The prefix itself may be a word.',
      'visit t → include cart :: cat lies outside this subtree.',
    ],
    'O(prefix length + visited subtree + output length)',
    'O(maximum word length) traversal plus output',
    'Autocomplete can return many words; its cost depends on output, not just prefix length.',
    'Must the prefix node itself be terminal to have matches?',
    ['No; descendants may complete words', 'Yes', 'Only with lowercase words'],
    'A prefix can exist without being inserted as a full word.',
  ),
];
