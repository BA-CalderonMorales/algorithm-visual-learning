import { visibleAlgorithms } from './model.ts';

export function createCatalogViewModel() {
  let query = $state('');
  let sortBy = $state('');
  let sortDirection = $state(1);
  const catalog = $derived(visibleAlgorithms(query).sort((a, b) => a.difficulty - b.difficulty));
  const displayedAlgorithms = $derived.by(() => {
    if (!sortBy) return catalog;
    return [...catalog].sort((a, b) => {
      const comparison =
        sortBy === 'divide'
          ? Number(a.divide.startsWith('Yes')) - Number(b.divide.startsWith('Yes'))
          : sortBy === 'difficulty'
            ? a.difficulty - b.difficulty
            : String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, { numeric: true, sensitivity: 'base' });
      return comparison * sortDirection;
    });
  });

  function sortCatalog(field) {
    if (sortBy === field) {
      if (sortDirection === 1) sortDirection = -1;
      else {
        sortBy = '';
        sortDirection = 1;
      }
    } else {
      sortBy = field;
      sortDirection = 1;
    }
  }

  return {
    get query() {
      return query;
    },
    set query(value) {
      query = value;
    },
    get sortBy() {
      return sortBy;
    },
    get sortDirection() {
      return sortDirection;
    },
    get displayedAlgorithms() {
      return displayedAlgorithms;
    },
    sortCatalog,
  };
}
