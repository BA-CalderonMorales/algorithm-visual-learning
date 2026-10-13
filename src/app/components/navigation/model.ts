import { algorithms } from '../../../algorithms/model.ts';
import { studyLessons, studyDomains, lessonHref } from '../../study-catalog.ts';
import { pattern, problems, problemHref } from '../../../problems/model.ts';
import { features } from '../../features.ts';
import { patterns, catalogLessons, catalogHref, topicKey } from '../../../problems/catalog/model.ts';

export interface NavigationLink {
  domain: string;
  key: string;
  label: string;
  href: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  symbol: string;
  overview: NavigationLink;
  topics: NavigationLink[];
}

// Use the existing catalogs: navigation must not maintain a second topic list.
const studyGroup = (id: 'discrete' | 'complexity' | 'structures', symbol: string): NavigationGroup => ({
  id,
  label: studyDomains[id].title,
  symbol,
  overview: { domain: id, key: 'index', label: 'All topics', href: `#/${id}` },
  topics: studyDomains[id].topics.map((key) => {
    const lesson = studyLessons[key as keyof typeof studyLessons];
    return { domain: id, key, label: lesson.title, href: lessonHref(lesson, 'understand') };
  }),
});

export const navigationGroups: NavigationGroup[] = [
  studyGroup('discrete', '∑'),
  studyGroup('complexity', 'O'),
  studyGroup('structures', '▤'),
  {
    id: 'algorithms',
    label: 'Algorithms',
    symbol: '↗',
    overview: { domain: 'algorithms', key: 'catalog', label: 'All sorting algorithms', href: '#/algorithms/sorting' },
    topics: [...algorithms]
      .sort((a, b) => a.difficulty - b.difficulty)
      .map(({ id, name }) => ({ domain: 'algorithms', key: id, label: name, href: `#/algorithms/${id}/understand` })),
  },
  {
    id: 'problems',
    label: 'Problems',
    symbol: '⋈',
    overview: { domain: 'problems', key: 'index', label: 'All patterns', href: '#/problems' },
    topics: [
      ...patterns.flatMap((p) => [
        { domain: 'problems', key: p.id, label: p.title, href: p.href },
        ...(p.id === 'two-pointers'
          ? problems.map((problem) => ({
              domain: 'problems',
              key: problem.id,
              label: problem.title,
              href: problemHref(problem.id),
            }))
          : []),
        ...catalogLessons
          .filter((entry) => entry.pattern === p.id)
          .map((entry) => ({ domain: 'problems', key: topicKey(entry), label: entry.title, href: catalogHref(entry) })),
      ]),
    ],
  },
].filter((group) => features.problems || group.id !== 'problems');

export interface PageLocation {
  domain: string;
  topic: string;
  homeView?: string;
  selectedAlgorithm?: { id: string };
}

export interface Breadcrumb {
  label: string;
  shortLabel?: string;
  href?: string;
  home?: boolean;
}

export const readingOrder = [
  { domain: 'overview', key: 'home', label: 'Study home', href: '#/home', section: 'Start here' },
  ...navigationGroups.flatMap((group) => [
    { ...group.overview, label: group.id === 'algorithms' ? 'Sorting algorithms' : group.label, section: 'Overview' },
    ...group.topics.map((topic) => ({ ...topic, section: group.label })),
  ]),
];

function currentKey(page: PageLocation) {
  return page.domain === 'algorithms' ? (page.selectedAlgorithm?.id ?? 'catalog') : page.topic;
}

export function breadcrumbsFor(page: PageLocation): Breadcrumb[] {
  const home = { label: 'Home', href: '#/home', home: true };
  const group = navigationGroups.find((group) => group.id === page.domain);
  if (!group) {
    const label = { resources: 'Resources', author: 'Author’s note' }[page.homeView ?? ''];
    return label ? [home, { label }] : [{ label: 'Study home', home: true }];
  }
  const topic = group.topics.find((topic) => topic.key === currentKey(page));
  const currentPattern =
    patterns.find((p) => p.id === topic?.key.split(':')[0]) ??
    (problems.some((p) => p.id === topic?.key) ? pattern : undefined);
  if (group.id === 'problems' && topic && currentPattern && topic.key !== currentPattern.id) {
    return [
      home,
      { label: group.label, href: group.overview.href },
      { label: currentPattern.title, shortLabel: 'Pattern', href: currentPattern.href },
      { label: topic.label },
    ];
  }
  return topic
    ? [
        home,
        {
          label: group.label,
          shortLabel: { algorithms: 'Sorting', discrete: 'Math', complexity: 'Complexity' }[group.id],
          href: group.overview.href,
        },
        { label: topic.label },
      ]
    : [home, { label: group.label }];
}

export function readingLinksFor(page: PageLocation) {
  const index = readingOrder.findIndex((item) => item.domain === page.domain && item.key === currentKey(page));
  return {
    previous: index > 0 ? readingOrder[index - 1] : undefined,
    next: index >= 0 ? readingOrder[index + 1] : undefined,
  };
}
