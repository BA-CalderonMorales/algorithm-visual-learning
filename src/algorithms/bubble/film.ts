import { bubbleTrace } from '../code-traces/adjacent.ts';
import { arrayStory } from '../play/story.ts';
import { item, row, frame, film } from '../../shared/playback/model.ts';
const trace = bubbleTrace([3, 1, 2]);
const identities = [0, 1, 2];
const frames = trace.scenes.map((scene) => {
  if (scene.title === 'Exchange the two neighbors') {
    const j = Number(scene.variables.j);
    [identities[j], identities[j + 1]] = [identities[j + 1], identities[j]];
  }
  const values = scene.rows[0].values;
  const roles = Object.fromEntries(
    values.map((_, i) => [
      i,
      scene.rows[0].active?.includes(i) ? 'compare' : scene.rows[0].settled?.includes(i) ? 'sorted' : 'neutral',
    ]),
  );
  return frame(
    'Compare and settle',
    scene.title,
    scene.why,
    row(
      values.map((value, index) => item(value, identities[index])),
      roles,
    ),
  );
});
export const playFilms = {
  bubble: film(
    'bubble',
    'Neighbors settle the suffix.',
    'Compare adjacent values, then decide whether a swap is needed.',
    arrayStory('bubble', frames),
    [{ title: 'Trace with code', href: '#/algorithms/bubble/walkthrough' }],
  ),
};
export const legend = [
  ['compare', 'Adjacent comparison'],
  ['sorted', 'Fixed suffix'],
];
