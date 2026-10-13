import { lessons as pointers } from './two-pointers.ts';
import { lessons as windows } from './sliding-window.ts';
import { lessons as intervals } from './intervals.ts';
import { lessons as stack } from './stack.ts';
import { lessons as linked } from './linked-list.ts';
import { lessons as binary } from './binary-search.ts';
import { lessons as heap } from './heap.ts';
import { lessons as dfs } from './depth-first-search.ts';
import { lessons as bfs } from './breadth-first-search.ts';
import { lessons as backtracking } from './backtracking.ts';
import { lessons as graphs } from './graphs.ts';
import { lessons as dp } from './dynamic-programming.ts';
import { lessons as greedy } from './greedy.ts';
import { lessons as trie } from './trie.ts';
import { lessons as prefix } from './prefix-sum.ts';
import { lessons as matrices } from './matrices.ts';

export const catalogLessons = [
  ...pointers,
  ...windows,
  ...intervals,
  ...stack,
  ...linked,
  ...binary,
  ...heap,
  ...dfs,
  ...bfs,
  ...backtracking,
  ...graphs,
  ...dp,
  ...greedy,
  ...trie,
  ...prefix,
  ...matrices,
];
export const patterns = [
  [
    'two-pointers',
    'Two Pointers',
    'Which endpoint can we safely retire?',
    'Use ordering, a retained prefix, or a boundary argument to eliminate choices without losing a solution.',
  ],
  [
    'sliding-window',
    'Sliding Window',
    'What changes when one boundary moves?',
    'Reuse a window summary. Start with a fixed length, then learn when expansion and contraction are justified.',
  ],
  [
    'intervals',
    'Intervals',
    'Where do ranges overlap, and what should survive?',
    'State endpoint conventions first. Sort ranges to merge coverage, schedule compatible events, or find shared gaps.',
  ],
  [
    'stack',
    'Stack',
    'Which unfinished choice must be resolved next?',
    'Use last-in-first-out state for nesting. Monotonic stacks add a value-order rule for unresolved candidates.',
  ],
  [
    'linked-list',
    'Linked List',
    'Which links preserve the rest of the chain?',
    'Track node identity and saved references while detecting cycles, reversing halves, and reconnecting pairs.',
  ],
  [
    'binary-search',
    'Binary Search',
    'What evidence lets us discard half the candidates?',
    'Search ordered values or a monotone feasibility boundary. Define what true means before moving a boundary.',
  ],
  [
    'heap',
    'Heap',
    'Which candidate belongs at the frontier?',
    'Keep the next smallest item, the weakest retained candidate, or two balanced halves without sorting everything repeatedly.',
  ],
  [
    'depth-first-search',
    'Depth-First Search',
    'What does this call receive, and what does it return?',
    'Follow a branch, preserve path context, and combine child summaries. Extend the same reasoning to graphs and matrices.',
  ],
  [
    'breadth-first-search',
    'Breadth-First Search',
    'What does one queue layer represent?',
    'Separate tree levels, equal-cost distances, and simultaneous sources. Mark on discovery to avoid repeated work.',
  ],
  [
    'backtracking',
    'Backtracking',
    'Which partial choices can still become solutions?',
    'Choose, explore, and undo. Keep the active candidate valid and prune only when no completion can succeed.',
  ],
  [
    'graphs',
    'Graphs',
    'Which edge and distance assumptions define the move?',
    'Represent prerequisites, detect cycles, and choose a shortest-path method that matches the cost model.',
  ],
  [
    'dynamic-programming',
    'Dynamic Programming',
    'What reusable question does one state answer?',
    'Define state meaning, dependencies, base cases, evaluation order, and answer extraction before optimizing storage.',
  ],
  [
    'greedy',
    'Greedy Algorithms',
    'Why can this local choice preserve a global optimum?',
    'Use an exchange argument, a dominance rule, or a reachable frontier. A plausible choice needs a proof.',
  ],
  [
    'trie',
    'Trie',
    'Which words share this prefix?',
    'Share character paths, distinguish prefixes from complete words, and explore only the matching subtree.',
  ],
  [
    'prefix-sum',
    'Prefix Sum',
    'Which two accumulated states describe this range?',
    'Turn range totals into boundary differences; count earlier prefix states when every subarray is a candidate.',
  ],
  [
    'matrices',
    'Matrices',
    'What stays unvisited or unchanged after this move?',
    'Track rectangular boundaries, coordinate mappings, and original-state markers to avoid duplicate or cascading updates.',
  ],
].map(([id, title, question, description]) => ({ id, title, question, description, href: `#/problems/${id}` }));

export const catalogHref = (entry, view = 'understand') => `#/problems/${entry.pattern}/${entry.id}/${view}`;
export const topicKey = (entry) => `${entry.pattern}:${entry.id}`;
export const catalogProblemTabs = ['understand', 'play', 'practice'];
export function findCatalogLesson(topic: string) {
  return catalogLessons.find((entry) => topicKey(entry) === topic);
}
export function parseCatalogRoute(hash: string) {
  const match = hash.match(/^#\/problems\/([^/]+)(?:\/([^/]+)(?:\/(understand|play|practice))?)?$/);
  if (!match || !patterns.some((pattern) => pattern.id === match[1])) return null;
  const pattern = match[1];
  if (!match[2] || match[2] === 'overview' || match[2] === 'connections') {
    return {
      topic: pattern,
      pattern,
      view: 'understand',
      directoryView: match[2] === 'connections' ? 'connections' : 'explore',
    };
  }
  const entry = catalogLessons.find((entry) => entry.pattern === pattern && entry.id === match[2]);
  return entry ? { topic: topicKey(entry), pattern, view: match[3] ?? 'understand', directoryView: 'explore' } : null;
}
export const catalogSearchEntries = [
  ...patterns.map((p) => ({
    title: `Problems · ${p.title}`,
    group: 'Problems',
    description: p.description,
    href: p.href,
    terms: `${p.title} overview introduction fundamentals`,
  })),
  ...catalogLessons.flatMap((entry) =>
    catalogProblemTabs.map((tab) => ({
      title: `${entry.title} · ${tab === 'play' ? 'Play' : tab === 'practice' ? 'Practice' : 'Understand'}`,
      group: `Problems · ${patterns.find((p) => p.id === entry.pattern)?.title}`,
      description: entry.idea,
      href: catalogHref(entry, tab),
      terms: `${entry.title} ${entry.idea} ${entry.pattern} ${tab}`,
    })),
  ),
];
