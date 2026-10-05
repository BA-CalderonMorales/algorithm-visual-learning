import { connectWalkthroughTheme } from './theme.ts';

export function createViewModel(props = () => ({})) {
  let { name, src, onShortcut } = $derived(props());
  let frame = $state(null);
  let status = $state('loading');
  let attempt = $state(0);

  $effect(() => {
    const element = frame;
    const expectedTitle = `${name} Walkthrough`.toLowerCase();
    // Capture the URL so a new algorithm starts its own monitor.
    const expectedUrl = src;
    if (!element) return;
    status = 'loading';
    let keyboardDocument;
    let disconnectTheme;
    let poll;
    let deadline;
    const stopWaiting = () => {
      clearInterval(poll);
      clearTimeout(deadline);
    };
    const inspect = () => {
      try {
        const doc = element.contentDocument;
        if (!doc || doc.URL !== expectedUrl) return false;
        if (doc.title.trim().toLowerCase() !== expectedTitle || !doc.querySelector('.history-row, .row')) return false;
        if (keyboardDocument !== doc) {
          disconnectTheme?.();
          disconnectTheme = connectWalkthroughTheme(doc);
          keyboardDocument?.removeEventListener('keydown', onShortcut);
          keyboardDocument = doc;
          doc.addEventListener('keydown', onShortcut);
        }
        status = 'ready';
        return true;
      } catch {
        return false;
      }
    };
    const loaded = () => {
      // Cached documents and HMR can finish before a load listener is attached.
      if (inspect()) stopWaiting();
    };
    const failed = () => {
      status = 'error';
      stopWaiting();
    };
    element.addEventListener('load', loaded);
    element.addEventListener('error', failed);
    poll = setInterval(loaded, 100);
    deadline = setTimeout(() => {
      if (!inspect()) failed();
      else stopWaiting();
    }, 8000);
    loaded();
    return () => {
      stopWaiting();
      element.removeEventListener('load', loaded);
      element.removeEventListener('error', failed);
      keyboardDocument?.removeEventListener('keydown', onShortcut);
      disconnectTheme?.();
    };
  });
  return {
    get frame() {
      return frame;
    },
    set frame(value) {
      frame = value;
    },
    get status() {
      return status;
    },
    set status(value) {
      status = value;
    },
    get attempt() {
      return attempt;
    },
    set attempt(value) {
      attempt = value;
    },
  };
}
