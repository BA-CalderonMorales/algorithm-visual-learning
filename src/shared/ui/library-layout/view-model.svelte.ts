import { tick } from 'svelte';

export function createViewModel(props) {
  let panel = $state<HTMLElement | null>(null);
  let collapsed = $state(false);
  const directory = $derived.by(() => {
    const { idPrefix, title } = props();
    return `${idPrefix}:${title}`;
  });
  $effect(() => {
    // Open every directory by default, without reopening on its tab changes.
    directory;
    collapsed = false;
  });
  function toggleRail() {
    const scroll = panel?.scrollTop;
    collapsed = !collapsed;
    // Width changes should not reset the reader's place.
    void tick().then(() => {
      if (panel && scroll !== undefined) panel.scrollTop = scroll;
    });
  }
  $effect(() => {
    const { selected, tabOrientation } = props();
    // Changing a directory tab resets only its reading area, never page scroll.
    if (tabOrientation !== 'vertical') return;
    let current = true;
    void tick().then(() => {
      if (current && panel) panel.scrollTo(0, 0);
    });
    return () => {
      current = false;
    };
  });
  return {
    get collapsed() {
      return collapsed;
    },
    toggleRail,
    get panel() {
      return panel;
    },
    set panel(value) {
      panel = value;
    },
  };
}
