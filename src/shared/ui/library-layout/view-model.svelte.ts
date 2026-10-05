import { onMount, tick } from 'svelte';

const railKey = 'study-directory-tabs-collapsed';

export function createViewModel(props) {
  let panel = $state<HTMLElement | null>(null);
  let collapsed = $state(false);
  onMount(() => {
    try {
      collapsed = localStorage.getItem(railKey) === 'true';
    } catch {
      /* Storage is optional; the rail still works. */
    }
  });
  function toggleRail() {
    const scroll = panel?.scrollTop;
    collapsed = !collapsed;
    try {
      localStorage.setItem(railKey, String(collapsed));
    } catch {
      /* Keep the in-memory preference if persistence is unavailable. */
    }
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
