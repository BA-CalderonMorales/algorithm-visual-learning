import { findCatalogLesson, catalogHref } from '../../catalog/model.ts';
export function createViewModel(props) {
  const lesson = $derived(findCatalogLesson(props().topic));
  let step = $state(0);
  let choice = $state<number | null>(null);
  let submitted = $state(false);
  let reflection = $state('');
  const offset = $derived((lesson?.id.length ?? 0) % 3);
  const options = $derived(lesson?.options.map((_, i) => lesson.options[(i + offset) % 3]) ?? []);
  const correct = $derived(choice !== null && (choice + offset) % 3 === lesson?.answer);
  const scene = $derived(lesson?.trace[step]);
  const tabs = $derived(
    ['understand', 'play', 'practice'].map((id) => ({
      id,
      label: id === 'play' ? 'Play' : id === 'practice' ? 'Practice' : 'Understand',
      href: catalogHref(lesson, id),
    })),
  );
  return {
    get lesson() {
      return lesson;
    },
    get scene() {
      return scene;
    },
    get step() {
      return step;
    },
    get tabs() {
      return tabs;
    },
    get options() {
      return options;
    },
    get choice() {
      return choice;
    },
    get submitted() {
      return submitted;
    },
    get correct() {
      return correct;
    },
    get reflection() {
      return reflection;
    },
    set reflection(value) {
      reflection = value;
    },
    move(delta) {
      step = Math.max(0, Math.min(lesson.trace.length - 1, step + delta));
    },
    choose(index) {
      choice = index;
      submitted = false;
    },
    check() {
      if (choice !== null) submitted = true;
    },
    retry() {
      choice = null;
      submitted = false;
    },
  };
}
