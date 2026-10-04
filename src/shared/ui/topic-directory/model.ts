import { lessonHref } from '../../study/routing.ts';

export function topicEntries(collection, lessons) {
  return collection.topics.map((id) => {
    const lesson = lessons[id];
    return {
      id,
      title: collection.title,
      question: lesson.title,
      href: lessonHref(lesson),
      description: lesson.question,
      navigationLabel: lesson.title + ' entry points',
      links: [
        { title: 'Understand', href: lessonHref(lesson) },
        { title: 'Visualize', href: lessonHref(lesson, 'visualize') },
        { title: 'Examples', href: lessonHref(lesson, 'examples') },
      ],
    };
  });
}
