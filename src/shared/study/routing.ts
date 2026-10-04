export const lessonTabs = [
  { id: 'understand', label: 'Understand' },
  { id: 'visualize', label: 'Visualize' },
  { id: 'examples', label: 'Examples' },
  { id: 'practice', label: 'Practice' },
];

export const lessonHref = (lesson, view = '') => `#/${lesson.domain}/${lesson.slug}${view ? `/${view}` : ''}`;
