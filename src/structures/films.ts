import { film, frame, text } from '../shared/playback/model.ts';
import { lessons } from './lessons.ts';
export const playFilms = Object.fromEntries(
  Object.values(lessons).map((lesson) => [
    lesson.id,
    film(
      lesson.id,
      lesson.title,
      lesson.idea,
      lesson.examples[0].steps.map((step, index) =>
        frame('Follow the state', step.title, step.body, [], {
          texts: [
            text('state', index === 0 ? lesson.examples[0].intro : step.title, 0.5, 0.38, 'key'),
            text('rule', lesson.anchorLabel, 0.5, 0.65, 'group', 0.8),
          ],
        }),
      ),
      [{ title: 'Practice this idea', href: `#/structures/${lesson.slug}/practice` }],
    ),
  ]),
);
