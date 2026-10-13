import { onMount, tick } from 'svelte';
import { revealWorkspace, headerOffset } from './model.ts';
export function createViewModel(props) {
  let host = $state<HTMLElement | null>(null);
  let collapsed = $state(true);
  let stickyTop = $state(114);
  let previous;
  const currentLabel = $derived(props().tabs.find((tab) => tab.id === props().selected)?.label ?? 'Sections');
  onMount(() => {
    const media = matchMedia('(max-width: 700px)');
    const measure = () => {
      stickyTop = headerOffset();
    };
    const update = () => {
      collapsed = true;
      measure();
    };
    const rail = () => host?.querySelector(':scope > .section-rail');
    const dismissOutside = (event: PointerEvent) => {
      if (!collapsed && event.target instanceof Node && !rail()?.contains(event.target)) collapsed = true;
    };
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (collapsed || event.key !== 'Escape') return;
      const focusedInside = rail()?.contains(document.activeElement);
      collapsed = true;
      if (focusedInside) rail()?.querySelector<HTMLButtonElement>('.section-toggle')?.focus();
    };
    update();
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('keydown', dismissWithEscape);
    media.addEventListener('change', update);
    window.addEventListener('resize', measure);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('keydown', dismissWithEscape);
      media.removeEventListener('change', update);
      window.removeEventListener('resize', measure);
    };
  });
  $effect(() => {
    const selected = props().selected;
    const changed = previous !== undefined && previous !== selected;
    previous = selected;
    if (changed) {
      collapsed = true;
      let active = true;
      tick().then(() => {
        if (active) revealWorkspace(host);
      });
      return () => {
        active = false;
      };
    }
  });
  return {
    select(event, tab) {
      collapsed = true;
      if (tab.id === props().selected) tick().then(() => revealWorkspace(host));
    },
    get stickyTop() {
      return stickyTop;
    },
    get host() {
      return host;
    },
    set host(value) {
      host = value;
    },
    get collapsed() {
      return collapsed;
    },
    get currentLabel() {
      return currentLabel;
    },
    toggle() {
      collapsed = !collapsed;
    },
  };
}
