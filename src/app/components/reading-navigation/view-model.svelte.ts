import { readingLinksFor, type PageLocation } from '../navigation/model.ts';

export function createReadingNavigation(context: () => PageLocation) {
  const links = $derived(readingLinksFor(context()));
  return {
    get links() {
      return links;
    },
  };
}
