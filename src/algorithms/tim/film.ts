import { film } from '../../shared/playback/model.ts';
import { mergeFilm } from '../merge/film.ts';

export const playFilms = {
  tim: film(
    'tim',
    'Notice the order already there.',
    'Reuse ordered runs, extend short ones when necessary, then merge.',
    mergeFilm(true),
    [
      { title: 'See how merging works', href: '#/algorithms/merge/play' },
      { title: 'Explore the full teaching trace', href: '#/algorithms/tim/walkthrough' },
    ],
    'This film isolates existing runs using minimum length 3. The walkthrough includes short-run extension; production TimSort also balances its run stack.',
  ),
};
export const legend = [
  ['group', 'Runs / pointers'],
  ['compare', 'Unused fronts'],
  ['key', 'Copy into output'],
  ['sorted', 'Verified runs / output'],
];
