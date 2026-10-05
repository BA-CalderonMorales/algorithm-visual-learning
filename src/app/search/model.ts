import { problemSearchEntries } from '../../problems/model.ts';

export const baseSearchEntries = [
  {
    title: 'Study home',
    group: 'Start here',
    description: 'A visual study guide for algorithms, discrete mathematics, and complexity.',
    href: '#/home',
    terms: 'learn study guide start overview',
  },
  {
    title: 'More learning resources',
    group: 'Start here',
    description:
      'AlgoMaster, NeetCode, Hello Interview for FAANG-focused prep, GetCracked for quant interviews, and free MIT courses.',
    href: '#/home/resources',
    terms:
      'resources courses paid free external learning hello interview hellointerview FAANG job hiring interview preparation getcracked get cracked quant trading hardware',
  },
  {
    title: 'A note from the author',
    group: 'Start here',
    description: 'Why this free, open-source study guide exists and how to contribute.',
    href: '#/home/author',
    terms: 'author about contribute open source MIT fork',
  },
  {
    title: 'Sorting algorithms',
    group: 'Algorithms',
    description: 'Browse and compare the sorting algorithm collection.',
    href: '#/algorithms/sorting',
    terms: 'sort catalogue sorting',
  },
  {
    title: 'Discrete mathematics',
    group: 'Learning domains',
    description: 'Choose a proof, sum, or recurrence to explore.',
    href: '#/discrete',
    terms: 'math proofs sums recurrences',
  },
  {
    title: 'Complexity',
    group: 'Learning domains',
    description: 'Learn asymptotic bounds, then analyze time and space.',
    href: '#/complexity',
    terms: 'time space work memory bounds growth',
  },
  {
    title: 'Asymptotic bounds',
    group: 'Complexity',
    description: 'Understand Big O, little o, Theta, Omega, and little omega as relationships between functions.',
    href: '#/complexity/asymptotic',
    terms: 'big o little o theta omega little omega upper lower tight asymptotic bound notation',
  },
  {
    title: 'Proof by induction',
    group: 'Discrete mathematics',
    description: 'Base case, inductive hypothesis, inductive step, and the bridge to the next case.',
    href: '#/discrete/induction',
    terms: 'proof base case hypothesis inductive step mathematical induction',
  },
  {
    title: 'Telescoping sums',
    group: 'Discrete mathematics',
    description: 'Rewrite terms as differences, cancel neighbors, and keep the endpoints.',
    href: '#/discrete/telescoping',
    terms: 'sum series cancellation endpoints partial fractions',
  },
  {
    title: 'Master theorem',
    group: 'Discrete mathematics',
    description: 'Classify divide-and-conquer recurrences with the standard cases.',
    href: '#/discrete/master-theorem',
    terms: 'recurrence divide conquer cases a b f(n) log',
  },
  {
    title: 'Time complexity',
    group: 'Complexity',
    description: 'Best, average, and worst cases; O, Ω, and Θ growth bounds.',
    href: '#/complexity/time',
    terms: 'runtime time big o omega theta growth asymptotic lower upper bound',
  },
  {
    title: 'Space complexity',
    group: 'Complexity',
    description: 'Total versus auxiliary memory, recursion stacks, and peak live storage.',
    href: '#/complexity/space',
    terms: 'memory space auxiliary total recursion stack',
  },
];
export function createSearchIndex(
  algorithms,
  algorithmLessons,
  studyLessons,
  studyDomains,
  lessonTabs,
  lessonHref,
  playFilms,
) {
  return [
    ...baseSearchEntries,
    ...problemSearchEntries,
    ...Object.values(studyLessons).flatMap((lesson) =>
      lessonTabs.map((tab) => ({
        title: `${lesson.title} · ${tab.label}`,
        group: studyDomains[lesson.domain].title,
        description: tab.id === 'visualize' ? (playFilms[lesson.id]?.takeaway ?? lesson.intro) : lesson.intro,
        href: lessonHref(lesson, tab.id),
        terms: `${lesson.idea} ${lesson.caution} ${lesson.examples.map((example) => example.title).join(' ')} ${tab.id}`,
      })),
    ),
    ...algorithms.flatMap((algorithm) => {
      const lesson = algorithmLessons[algorithm.id];
      const context = [
        algorithm.cue,
        algorithm.extra,
        lesson?.idea,
        lesson?.invariant,
        lesson?.example,
        lesson?.watch,
        lesson?.practice,
        lesson?.answer,
        ...(lesson?.practiceChecks ?? []).flatMap((check) => [check.title, check.prompt, check.answer]),
      ]
        .filter(Boolean)
        .join(' ');
      return [
        {
          title: `${algorithm.name} · Understand`,
          group: 'Algorithms',
          description: `${algorithm.cue} ${lesson?.idea ?? ''} ${lesson?.watch ?? ''}`,
          href: `#/algorithms/${algorithm.id}/understand`,
          terms: context,
        },
        {
          title: `${algorithm.name} · Step-by-step`,
          group: 'Algorithms',
          description: `Follow the ${algorithm.name} walkthrough one action at a time.`,
          href: `#/algorithms/${algorithm.id}/walkthrough`,
          terms: context,
        },
        {
          title: `${algorithm.name} · Play`,
          group: 'Algorithms',
          description: playFilms[algorithm.id].takeaway,
          href: `#/algorithms/${algorithm.id}/play`,
          terms: `${context} animation film motion replay reverse`,
        },
        {
          title: `${algorithm.name} · Implementations`,
          group: 'Algorithms',
          description: 'Simple Python, typed Python, JavaScript, and TypeScript code.',
          href: `#/algorithms/${algorithm.id}/python/simple`,
          terms: context,
        },
        {
          title: `${algorithm.name} · Practice`,
          group: 'Algorithms',
          description: lesson?.practice ?? 'Practice the key decisions in this algorithm.',
          href: `#/algorithms/${algorithm.id}/practice`,
          terms: context,
        },
        {
          title: `${algorithm.name} · Complexity`,
          group: 'Algorithms',
          description: `Best: ${lesson?.best ?? ''}; average: ${lesson?.average ?? ''}; worst: ${lesson?.worst ?? ''}; space: ${lesson?.space ?? ''}`,
          href: `#/algorithms/${algorithm.id}/complexity`,
          terms: `${context} ${lesson?.best ?? ''} ${lesson?.average ?? ''} ${lesson?.worst ?? ''} ${lesson?.space ?? ''} ${algorithm.lower} ${algorithm.upper}`,
        },
        {
          title: `${algorithm.name} · Growth`,
          group: 'Algorithms',
          description: 'Compare theoretical best-, average-, and worst-case operation growth as input size increases.',
          href: `#/algorithms/${algorithm.id}/growth`,
          terms: `${context} growth operation count dominant case theoretical chart`,
        },
      ];
    }),
  ];
}

export function searchTopics(globalSearchQuery, searchIndex) {
  const terms = globalSearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return baseSearchEntries.slice(0, 6);
  return searchIndex
    .map((entry) => {
      const haystack = `${entry.title} ${entry.group} ${entry.description} ${entry.terms}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce(
        (sum, term) =>
          sum + (entry.title.toLowerCase().includes(term) ? 4 : entry.description.toLowerCase().includes(term) ? 2 : 1),
        0,
      );
      return { ...entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}
