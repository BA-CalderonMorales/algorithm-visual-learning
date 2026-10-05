import { highlightCode } from './model.ts';
import { untrack } from 'svelte';
// Lazy text imports: the application never executes displayed source.
export function createViewModel(props) {
  let source = $state('');
  let loadedKey = $state('');
  let loading = $state(true);
  let error = $state('');
  let scroll = $state<HTMLElement | null>(null);
  const lines = $derived(highlightCode(source, props().language));
  $effect(() => {
    const { sourceKey, loadSource } = props();
    let current = true;
    source = '';
    error = '';
    loading = true;
    untrack(() => scroll?.scrollTo(0, 0));
    Promise.resolve()
      .then(() => loadSource(sourceKey))
      .then((text) => {
        if (current) {
          source = text;
          loadedKey = sourceKey;
        }
      })
      .catch((failure) => {
        if (current) {
          error = failure.message || 'Could not load this implementation. Try refreshing.';
          loadedKey = sourceKey;
        }
      })
      .finally(() => {
        if (current) loading = false;
      });
    // A slower previous import must not replace the newly selected source.
    return () => {
      current = false;
    };
  });
  return {
    get sourceKey() {
      return loadedKey;
    },
    get lines() {
      return lines;
    },
    get loading() {
      return loading || loadedKey !== props().sourceKey;
    },
    get error() {
      return error;
    },
    get scroll() {
      return scroll;
    },
    set scroll(value) {
      scroll = value;
    },
  };
}
