import { routeEnabled } from '../../app/features.ts';

export const entries = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    question: 'What moves, and why?',
    href: '#/algorithms/sorting',
    description: 'Compare eight sorting algorithms, trace their decisions, and read the code.',
    links: [
      { title: 'Selection sort', href: '#/algorithms/selection/understand' },
      { title: 'Shell sort', href: '#/algorithms/shell/play' },
      { title: 'All sorting algorithms', href: '#/algorithms/sorting' },
    ],
  },
  {
    id: 'discrete',
    title: 'Discrete mathematics',
    question: 'Why does it work?',
    href: '#/discrete',
    description: 'Prove a pattern, cancel a sum, or find the work in a recursion tree.',
    links: [
      { title: 'Induction', href: '#/discrete/induction' },
      { title: 'Telescoping', href: '#/discrete/telescoping' },
      { title: 'Master theorem', href: '#/discrete/master-theorem' },
    ],
  },
  {
    id: 'complexity',
    title: 'Complexity',
    question: 'How do growth rates compare?',
    href: '#/complexity',
    description: 'Understand asymptotic bounds first, then analyze algorithm time and memory.',
    links: [
      { title: 'Asymptotic bounds', href: '#/complexity/asymptotic' },
      { title: 'Time', href: '#/complexity/time' },
      { title: 'Space', href: '#/complexity/space' },
    ],
  },
  {
    id: 'structures',
    title: 'Data structures',
    question: 'What does the representation make easy?',
    href: '#/structures',
    description:
      'Separate the List ADT, Python object references, array slots, and linked nodes. Preserve links while inserting.',
    links: [
      { title: 'The List ADT', href: '#/structures/list-adt' },
      { title: 'Insert a node', href: '#/structures/list-insertion/visualize' },
      { title: 'All data structures', href: '#/structures' },
    ],
  },
  {
    id: 'problems',
    title: 'Problems',
    question: 'Why is this the next move?',
    href: '#/problems',
    description:
      'Build problem-solving intuition across sixteen patterns. Trace the decisions, state the assumptions, and practice explaining why the move is safe.',
    links: [
      { title: 'Two Pointers', href: '#/problems/two-pointers' },
      { title: 'Watch Two Sum', href: '#/problems/two-pointers/two-sum/play' },
      { title: 'Watch 3-Sum', href: '#/problems/two-pointers/three-sum/play' },
      { title: 'Sliding Window', href: '#/problems/sliding-window' },
    ],
  },
].filter((entry) => routeEnabled(entry.href));

export function directoryTabs(href) {
  return [
    { id: 'explore', label: 'Explore', href },
    { id: 'connections', label: 'Connections', href: href + '/connections' },
  ];
}
export function relatedDomains(domain) {
  return entries.filter((entry) => entry.id !== domain);
}
