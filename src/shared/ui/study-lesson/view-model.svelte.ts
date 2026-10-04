import { tick } from 'svelte';

import { lessonTabs, lessonHref } from '../../study/routing.ts';

export function createViewModel(props = () => ({})) {
  let { lesson, view = 'understand' } = $derived(props());
  let exampleIndex = $state(0);
  let scroller = $state(null);
  let example = $derived(lesson.examples[exampleIndex]);
  $effect(() => {
    view;
    tick().then(() => {
      if (scroller) scroller.scrollTop = 0;
    });
  });
  async function chooseExample(index) {
    exampleIndex = index;
    await tick();
    scroller.scrollTop = 0;
  }
  return {
    get lessonTabs() {
      return lessonTabs;
    },
    get lessonHref() {
      return lessonHref;
    },
    get exampleIndex() {
      return exampleIndex;
    },
    set exampleIndex(value) {
      exampleIndex = value;
    },
    get scroller() {
      return scroller;
    },
    set scroller(value) {
      scroller = value;
    },
    get example() {
      return example;
    },
    get chooseExample() {
      return chooseExample;
    },
  };
}
