import { playFilms as selection, legend as selectionLegend } from '../algorithms/selection/film.ts';
import { playFilms as insertion, legend as insertionLegend } from '../algorithms/insertion/film.ts';
import { playFilms as shell, legend as shellLegend } from '../algorithms/shell/film.ts';
import { playFilms as quick, legend as quickLegend } from '../algorithms/quick/film.ts';
import { playFilms as merge, legend as mergeLegend } from '../algorithms/merge/film.ts';
import { playFilms as tim, legend as timLegend } from '../algorithms/tim/film.ts';
import { playFilms as counting, legend as countingLegend } from '../algorithms/counting/film.ts';
import {
  playFilms as induction,
  legend as inductionLegend,
  variants as inductionVariants,
} from '../discrete/induction/film.ts';
import {
  playFilms as telescoping,
  legend as telescopingLegend,
  variants as telescopingVariants,
} from '../discrete/telescoping/film.ts';
import {
  playFilms as master,
  legend as masterLegend,
  variants as masterChoices,
} from '../discrete/master-theorem/film.ts';
import { playFilms as time, legend as timeLegend, variants as timeVariants } from '../complexity/time/film.ts';
import { playFilms as space, legend as spaceLegend, variants as spaceVariants } from '../complexity/space/film.ts';
export { sceneAt, chaptersFor } from '../shared/playback/model.ts';
export const playFilms = {
  ...selection,
  ...insertion,
  ...shell,
  ...quick,
  ...merge,
  ...tim,
  ...counting,
  ...induction,
  ...telescoping,
  ...master,
  ...time,
  ...space,
};
export const conceptVariants = {
  master: masterChoices,
  induction: inductionVariants,
  telescoping: telescopingVariants,
  time: timeVariants,
  space: spaceVariants,
};
export const conceptLegends = {
  selection: selectionLegend,
  insertion: insertionLegend,
  shell: shellLegend,
  quick: quickLegend,
  merge: mergeLegend,
  tim: timLegend,
  counting: countingLegend,
  induction: inductionLegend,
  telescoping: telescopingLegend,
  master: masterLegend,
  time: timeLegend,
  space: spaceLegend,
};
export const masterVariants = conceptVariants.master;
