import { lessonHref } from '../../study/routing.ts';

export function topicEntries(collection, lessons) {
  return collection.topics.map((id) => {
    const lesson = lessons[id];
    return {
      id,
      title: lesson.title,
      question: lesson.title,
      href: lessonHref(lesson),
      description: lesson.question,
      navigationLabel: lesson.title + ' entry points',
      links: [
        { title: 'Visualize', href: lessonHref(lesson, 'visualize') },
        { title: 'Examples', href: lessonHref(lesson, 'examples') },
      ],
    };
  });
}
