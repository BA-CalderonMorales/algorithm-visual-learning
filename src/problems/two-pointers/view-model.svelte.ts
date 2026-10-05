import { tick } from 'svelte';
import { problems, problemTabs, problemHref } from '../model.ts';
import { examples } from './films.ts';

export function createViewModel(props) {
  const lesson = $derived(problems.find((problem) => problem.id === props().id));
  const variants = $derived(examples[props().id]);
  const tabs = $derived(problemTabs.map((tab) => ({ ...tab, href: problemHref(props().id, tab.id) })));
  let scroll = $state<HTMLElement | null>(null);
  $effect(() => {
    props().view;
    void tick().then(() => {
      if (scroll) scroll.scrollTop = 0;
    });
  });
  return {
    get lesson() {
      return lesson;
    },
    get variants() {
      return variants;
    },
    get tabs() {
      return tabs;
    },
    get scroll() {
      return scroll;
    },
    set scroll(value) {
      scroll = value;
    },
  };
}
