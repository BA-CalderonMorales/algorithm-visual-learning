import { routeEnabled } from '../../app/features.ts';

export const entries = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    question: 'What moves, and why?',
    href: '#/algorithms/sorting',
    description: 'Compare seven sorting algorithms. Follow their decisions, then read the code.',
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
    id: 'problems',
    title: 'Problems',
    question: 'Why is this the next move?',
    href: '#/problems',
    description:
      'Build interview intuition by pattern. Start with Two Pointers: sorted pairs, container walls, and 3-Sum.',
    links: [
      { title: 'Two Pointers', href: '#/problems/two-pointers' },
      { title: 'Watch Two Sum', href: '#/problems/two-pointers/two-sum/play' },
      { title: 'Watch 3-Sum', href: '#/problems/two-pointers/three-sum/play' },
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
