import { breadcrumbsFor, type PageLocation } from '../navigation/model.ts';

export function createHeaderViewModel(context: () => PageLocation) {
  const breadcrumbs = $derived(breadcrumbsFor(context()));
  return {
    get breadcrumbs() {
      return breadcrumbs;
    },
  };
}
