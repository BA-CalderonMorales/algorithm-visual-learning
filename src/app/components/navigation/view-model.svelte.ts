import { onMount, tick, untrack } from 'svelte';
import { navigationGroups, type NavigationLink } from './model.ts';

interface NavigationContext {
  domain: string;
  topic: string;
  selectedAlgorithm?: { id: string };
  navOpen: boolean;
  globalSearchOpen: boolean;
}

export function createNavigationViewModel(context: () => NavigationContext) {
  let expanded = $state<Record<string, boolean>>({});
  let element = $state<HTMLElement | null>(null);
  let opener: HTMLElement | null = null;
  const activeKey = $derived(
    context().domain === 'algorithms' ? (context().selectedAlgorithm?.id ?? 'catalog') : context().topic,
  );

  // Reveal a new destination, but preserve disclosures when only its tab changes.
  $effect(() => {
    const domain = context().domain;
    if (activeKey && navigationGroups.some((group) => group.id === domain)) {
      untrack(() => {
        expanded = { ...expanded, [domain]: true };
      });
    }
  });

  $effect(() => {
    const open = context().navOpen;
    if (!open || !element) return;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    void tick().then(() => {
      if (!context().navOpen) return;
      const selected = element?.querySelector<HTMLElement>('[aria-current="page"]');
      const current = selected?.getClientRects().length ? selected : null;
      (current ?? element?.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true });
      current?.scrollIntoView({ block: 'nearest' });
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      void tick().then(() => {
        if (!context().navOpen && !context().globalSearchOpen) opener?.focus({ preventScroll: true });
      });
    };
  });

  function close() {
    context().navOpen = false;
  }

  onMount(() => {
    function handleKey(event: KeyboardEvent) {
      if (!context().navOpen || !element) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      // Search is another modal; do not stack it over an open navigation drawer.
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const targets = [...element.querySelectorAll<HTMLElement>('a[href], button')].filter(
        (target) => target.getClientRects().length > 0,
      );
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return {
    groups: navigationGroups,
    get element() {
      return element;
    },
    set element(value: HTMLElement | null) {
      element = value;
    },
    get homeActive() {
      return context().domain === 'overview';
    },
    isCurrentDomain: (id: string) => context().domain === id,
    isExpanded: (id: string) => Boolean(expanded[id]),
    isActive: (link: NavigationLink) => context().domain === link.domain && activeKey === link.key,
    toggle: (id: string) => {
      expanded = { ...expanded, [id]: !expanded[id] };
    },
    close,
  };
}
