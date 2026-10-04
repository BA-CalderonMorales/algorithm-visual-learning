import { highlightCode } from './model.ts';

export function createImplementationViewModel(props) {
  let source = $state('');
  let loading = $state(false);
  let error = $state('');
  const lines = $derived(highlightCode(source, props().language));

  $effect(() => {
    const { algorithm, language, enabled } = props();
    if (!enabled || !algorithm) return;
    const request = new AbortController();
    source = '';
    error = '';
    loading = true;
    const files = {
      'python-simple': algorithm.simplePython,
      'python-typed': algorithm.python,
      javascript: algorithm.javascript,
      typescript: algorithm.typescript,
    };
    const url = new URL(`${import.meta.env.BASE_URL}walkthroughs/${files[language]}`, window.location.href);
    async function load() {
      try {
        const response = await fetch(url, { signal: request.signal });
        if (!response.ok) throw new Error(`Could not load the implementation (${response.status}).`);
        if (response.headers.get('content-type')?.includes('text/html')) {
          throw new Error(
            'The implementation URL returned the site page instead of source code. Check the site base path.',
          );
        }
        const text = await response.text();
        if (!request.signal.aborted) source = text;
      } catch (failure) {
        if (!request.signal.aborted) error = failure.message || 'Could not load this implementation.';
      } finally {
        if (!request.signal.aborted) loading = false;
      }
    }
    void load();
    return () => request.abort();
  });

  return {
    get lines() {
      return lines;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
  };
}
