import { onMount, tick } from 'svelte';
import { themes, isTheme } from './model.ts';

const themeKey = 'study-theme';
const widthKey = 'study-full-width';

export function createAppearanceViewModel() {
  let theme = $state('dark');
  let fullWidth = $state(false);
  let open = $state(false);
  let trigger = $state<HTMLButtonElement | null>(null);
  let menu = $state<HTMLElement | null>(null);

  function apply() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.width = fullWidth ? 'full' : 'reading';
  }

  function save() {
    apply();
    try {
      localStorage.setItem(themeKey, theme);
      localStorage.setItem(widthKey, String(fullWidth));
    } catch {
      // Private/embedded browsers can deny storage; controls still work.
    }
  }

  onMount(() => {
    try {
      const savedTheme = localStorage.getItem(themeKey);
      if (isTheme(savedTheme)) theme = savedTheme!;
      fullWidth = localStorage.getItem(widthKey) === 'true';
    } catch {
      // Keep the original palette and reading width if storage is unavailable.
    }
    apply();
  });

  async function toggleMenu() {
    open = !open;
    if (open) {
      await tick();
      menu?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    }
  }

  function close(restoreFocus = false) {
    open = false;
    if (restoreFocus) trigger?.focus();
  }

  function choose(id: string) {
    if (!isTheme(id)) return;
    theme = id;
    save();
    close(true);
  }

  function toggleWidth() {
    fullWidth = !fullWidth;
    save();
  }

  function closeOutside(event: MouseEvent) {
    if (open && event.target instanceof Element && !event.target.closest('.theme-picker')) close();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    const options = [...(menu?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])];
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? options.length - 1
            : (index + (event.key === 'ArrowUp' ? -1 : 1) + options.length) % options.length;
      options[next]?.focus();
    } else if (event.key === 'Tab') close();
  }

  return {
    themes,
    choose,
    toggleMenu,
    toggleWidth,
    closeOutside,
    handleKeydown,
    get theme() {
      return theme;
    },
    get fullWidth() {
      return fullWidth;
    },
    get open() {
      return open;
    },
    get trigger() {
      return trigger;
    },
    set trigger(value) {
      trigger = value;
    },
    get menu() {
      return menu;
    },
    set menu(value) {
      menu = value;
    },
  };
}
