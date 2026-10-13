import { lessons as structures } from '../structures/lessons.ts';
import { collection as structuresDomain } from '../structures/model.ts';
import { lesson as lowerBound } from '../complexity/lower-bound/model.ts';
import { lesson as induction } from '../discrete/induction/model.ts';
import { lesson as telescoping } from '../discrete/telescoping/model.ts';
import { lesson as master } from '../discrete/master-theorem/model.ts';
import { lesson as time } from '../complexity/time/model.ts';
import { lesson as asymptotic } from '../complexity/asymptotic/model.ts';
import { lesson as space } from '../complexity/space/model.ts';
import { collection as discrete } from '../discrete/model.ts';
import { collection as complexity } from '../complexity/model.ts';
export { lessonTabs, lessonHref } from '../shared/study/routing.ts';

export const studyLessons = {
  induction,
  telescoping,
  master,
  time,
  asymptotic,
  space,
  'lower-bound': lowerBound,
  ...structures,
};
export const studyDomains = { discrete, complexity, structures: structuresDomain };
