import { breadcrumbsFor, type PageLocation } from '../navigation/model.ts';
import { createAppearanceViewModel } from '../appearance/view-model.svelte.ts';

export function createHeaderViewModel(context: () => PageLocation) {
  const breadcrumbs = $derived(breadcrumbsFor(context()));
  const appearance = createAppearanceViewModel();
  return {
    appearance,
    get breadcrumbs() {
      return breadcrumbs;
    },
  };
}
