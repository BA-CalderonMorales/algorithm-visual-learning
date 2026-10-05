import { lessons } from './two-pointers/lessons.ts';
import { implementationSelection } from './two-pointers/implementations/model.ts';

export const problems = lessons;
export const pattern = {
  id: 'two-pointers',
  title: 'Two Pointers',
  question: 'Which choices can we safely stop checking?',
  description:
    'Two positions, one reason to move. Start with a sorted pair, compare two walls, then reuse the pair search inside 3-Sum.',
  href: '#/problems/two-pointers',
  reference: 'https://www.hellointerview.com/learn/code/two-pointers/overview',
  links: lessons.map((lesson) => ({ title: lesson.title, href: problemHref(lesson.id) })),
};

export const problemTabs = [
  { id: 'understand', label: 'Understand' },
  { id: 'play', label: 'Play' },
  { id: 'practice', label: 'Practice' },
  { id: 'implementations', label: 'Implementations' },
];

export function problemHref(id: string, view = 'understand') {
  return `#/problems/two-pointers/${id}/${view}`;
}

export function parseProblemRoute(hash: string) {
  const route = hash.match(
    /^#\/problems(?:\/(connections|two-pointers)(?:\/([^/]+)(?:\/(understand|play|practice|implementations)(?:\/(.+))?)?)?)?$/,
  );
  if (!route) return null;
  if (!route[1] || route[1] === 'connections') {
    return { topic: 'index', view: 'understand', directoryView: route[1] ?? 'explore' };
  }
  if (!route[2]) return { topic: 'two-pointers', view: 'understand', directoryView: 'explore' };
  if (route[2] === 'connections' && !route[3])
    return { topic: 'two-pointers', view: 'understand', directoryView: 'connections' };
  if (!problems.some((problem) => problem.id === route[2])) return null;
  if (route[4] && route[3] !== 'implementations') return null;
  const selection = implementationSelection(route[4] ?? '');
  if (!selection) return null;
  return { topic: route[2], view: route[3] ?? 'understand', directoryView: 'explore', ...selection };
}

export const problemSearchEntries = [
  {
    title: 'Problems · Two Pointers',
    group: 'Problems',
    description: pattern.question,
    href: pattern.href,
    terms: 'interview patterns two pointers two sum container three sum 3-sum',
  },
  ...problems.flatMap((problem) =>
    problemTabs.map((tab) => ({
      title: `${problem.title} · ${tab.label}`,
      group: 'Problems · Two Pointers',
      description: problem.idea,
      href: problemHref(problem.id, tab.id),
      terms: `${problem.title} ${problem.question} ${problem.precondition} ${tab.id} interview pattern`,
    })),
  ),
];
