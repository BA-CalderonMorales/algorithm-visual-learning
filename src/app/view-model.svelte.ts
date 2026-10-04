import { onMount } from 'svelte';
import { createSearchIndex, searchTopics } from './search/model.ts';
import { createImplementationViewModel } from '../algorithms/components/implementation/view-model.svelte.ts';
import { createCatalogViewModel } from '../algorithms/view-model.svelte.ts';
import { algorithms } from '../algorithms/model.ts';
import { algorithmLessons } from '../algorithms/lessons.ts';

import { getGrowthModel } from '../algorithms/components/growth/model.ts';

import { playFilms, conceptVariants, conceptLegends } from './film-catalog.ts';
import { voiceForFilm } from '../algorithms/play/voice.ts';

import { studyLessons, studyDomains, lessonTabs, lessonHref } from './study-catalog.ts';

export function createViewModel() {
  const catalog = createCatalogViewModel();
  let domain = $state('overview');
  let topic = $state('home');
  let studyView = $state('understand');
  let homeView = $state('explore');
  let selectedStudyLesson = $derived(studyLessons[topic]);
  let navOpen = $state(false);
  let globalSearchOpen = $state(false);
  let globalSearchQuery = $state('');
  let globalSearchInput = $state(null);
  let activeSearchIndex = $state(0);
  let fullscreenActive = $state(false);
  let heroVisible = $state(false);
  let selectedAlgorithmId = $state('');
  let algorithmView = $state('walkthrough');
  let shellGapSequence = $state('halving');
  let selectedGrowthModel = $derived(getGrowthModel(selectedAlgorithmId, shellGapSequence));
  let implementationLanguage = $state('python-simple');
  let selectedAlgorithm = $derived(algorithms.find((algorithm) => algorithm.id === selectedAlgorithmId));
  let selectedLesson = $derived(algorithmLessons[selectedAlgorithmId]);
  const implementation = createImplementationViewModel(() => ({
    algorithm: selectedAlgorithm,
    language: implementationLanguage,
    enabled: algorithmView === 'implementation',
  }));

  const searchIndex = createSearchIndex(
    algorithms,
    algorithmLessons,
    studyLessons,
    studyDomains,
    lessonTabs,
    lessonHref,
    playFilms,
  );
  const searchResults = $derived(searchTopics(globalSearchQuery, searchIndex));

  const returnToTop = () => requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));

  function walkthroughUrl(algorithm) {
    const publicBase = new URL(import.meta.env.BASE_URL, window.location.href);
    return new URL(`walkthroughs/${algorithm.walkthrough}`, publicBase).href;
  }

  const routeTopics = {
    '#/home': ['overview', 'home'],
    '#/home/resources': ['overview', 'home'],
    '#/home/author': ['overview', 'home'],
    '#/algorithms/sorting': ['algorithms', 'catalog'],
    '#/discrete': ['discrete', 'index'],
    '#/complexity': ['complexity', 'index'],
    '#/discrete/induction': ['discrete', 'induction'],
    '#/discrete/telescoping': ['discrete', 'telescoping'],
    '#/discrete/master-theorem': ['discrete', 'master'],
    '#/complexity/time': ['complexity', 'time'],
    '#/complexity/asymptotic': ['complexity', 'asymptotic'],
    '#/complexity/space': ['complexity', 'space'],
  };

  const openPage = (nextDomain, nextTopic) => {
    domain = nextDomain;
    topic = nextTopic;
    studyView = 'understand';
    selectedAlgorithmId = '';
    catalog.query = '';
    navOpen = false;
    returnToTop();
    const route = Object.entries(routeTopics).find(([, page]) => page[0] === nextDomain && page[1] === nextTopic)?.[0];
    if (route && window.location.hash !== route) window.location.hash = route;
  };

  onMount(() => {
    const handleGlobalKeydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        activeSearchIndex = 0;
        globalSearchOpen = true;
        requestAnimationFrame(() => globalSearchInput?.focus());
      } else if (event.key === 'Escape' && globalSearchOpen) {
        globalSearchOpen = false;
        requestAnimationFrame(() => document.querySelector('.global-search-trigger')?.focus());
      } else if (event.key === 'Tab' && globalSearchOpen) {
        const focusable = [...document.querySelectorAll('.site-search input, .site-search a[href]')];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const syncFullscreen = () => (fullscreenActive = Boolean(document.fullscreenElement));
    window.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('fullscreenchange', syncFullscreen);
    const applyRoute = () => {
      const algorithmRoute = window.location.hash.match(
        /^#\/algorithms\/([^/]+)\/(understand|play|walkthrough|practice|complexity|growth|python(?:\/(?:simple|typed))?|javascript|typescript)$/,
      );
      if (algorithmRoute) {
        const algorithm = algorithms.find((entry) => entry.id === decodeURIComponent(algorithmRoute[1]));
        if (algorithm) {
          const switchingViewForSameAlgorithm =
            domain === 'algorithms' && topic === 'algorithm' && selectedAlgorithmId === algorithm.id;
          domain = 'algorithms';
          topic = 'algorithm';
          selectedAlgorithmId = algorithm.id;
          const view = algorithmRoute[2];
          algorithmView = ['understand', 'play', 'walkthrough', 'practice', 'complexity', 'growth'].includes(view)
            ? view
            : 'implementation';
          implementationLanguage =
            view === 'javascript' || view === 'typescript'
              ? view
              : view === 'python/typed'
                ? 'python-typed'
                : 'python-simple';
          navOpen = false;
          if (!switchingViewForSameAlgorithm) returnToTop();
          return;
        }
      }
      const studyRoute = window.location.hash.match(
        /^#\/(discrete|complexity)\/([^/]+)(?:\/(understand|visualize|examples|practice))?$/,
      );
      if (studyRoute) {
        const lesson = Object.values(studyLessons).find(
          (entry) => entry.domain === studyRoute[1] && entry.slug === studyRoute[2],
        );
        if (lesson) {
          const sameLesson = domain === lesson.domain && topic === lesson.id;
          domain = lesson.domain;
          topic = lesson.id;
          studyView = studyRoute[3] || 'understand';
          selectedAlgorithmId = '';
          navOpen = false;
          if (!sameLesson) returnToTop();
          return;
        }
      }
      const [nextDomain, nextTopic] = routeTopics[window.location.hash] ?? routeTopics['#/home'];
      homeView =
        window.location.hash === '#/home/resources'
          ? 'resources'
          : window.location.hash === '#/home/author'
            ? 'author'
            : 'explore';
      domain = nextDomain;
      topic = nextTopic;
      selectedAlgorithmId = '';
    };
    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    return () => {
      window.removeEventListener('hashchange', applyRoute);
      window.removeEventListener('keydown', handleGlobalKeydown);
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  });

  function handleSearchKeydown(event) {
    if (event.key === 'ArrowDown' && searchResults.length) {
      event.preventDefault();
      activeSearchIndex = (activeSearchIndex + 1) % searchResults.length;
    } else if (event.key === 'ArrowUp' && searchResults.length) {
      event.preventDefault();
      activeSearchIndex = (activeSearchIndex - 1 + searchResults.length) % searchResults.length;
    } else if (event.key === 'Enter' && searchResults[activeSearchIndex]) {
      event.preventDefault();
      openSearchResult(searchResults[activeSearchIndex]);
    }
  }

  function openSearchResult(result) {
    globalSearchOpen = false;
    globalSearchQuery = '';
    window.location.hash = result.href;
  }

  function openSearch() {
    activeSearchIndex = 0;
    globalSearchOpen = true;
    requestAnimationFrame(() => globalSearchInput?.focus());
  }
  function closeSearchBackdrop(event) {
    if (event.target === event.currentTarget) globalSearchOpen = false;
  }
  function selectSearchResult(event, result) {
    event.preventDefault();
    openSearchResult(result);
  }
  function resetSearchSelection() {
    activeSearchIndex = 0;
  }

  function handleFrameShortcut(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      activeSearchIndex = 0;
      globalSearchOpen = true;
      requestAnimationFrame(() => globalSearchInput?.focus());
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be unavailable in embedded browsers; keep the page usable.
    }
  }

  const isActive = (nextDomain, nextTopic) => domain === nextDomain && topic === nextTopic;

  const pageTitle = $derived(
    domain === 'algorithms'
      ? topic === 'algorithm'
        ? (selectedAlgorithm?.name ?? 'Algorithm')
        : 'Algorithms'
      : domain === 'discrete'
        ? (selectedStudyLesson?.title ?? 'Discrete mathematics')
        : domain === 'complexity'
          ? ({ time: 'Time complexity', space: 'Space complexity' }[topic] ?? 'Complexity')
          : 'A visual DSA study guide',
  );

  const pageKicker = $derived(
    domain === 'algorithms'
      ? 'Algorithms · interactive walkthroughs'
      : domain === 'discrete'
        ? 'Discrete math · build the reasoning'
        : domain === 'complexity'
          ? 'Complexity · analyze the resources'
          : 'A growing companion for data structures & algorithms',
  );
  return {
    get pythonLoading() {
      return implementation.loading;
    },
    get pythonError() {
      return implementation.error;
    },
    get highlightedLines() {
      return implementation.lines;
    },
    get implementationLanguage() {
      return implementationLanguage;
    },
    openSearch,
    closeSearchBackdrop,
    selectSearchResult,
    resetSearchSelection,
    get conceptVariants() {
      return conceptVariants;
    },
    get conceptLegends() {
      return conceptLegends;
    },
    get voiceForFilm() {
      return voiceForFilm;
    },
    get playFilms() {
      return playFilms;
    },
    get studyLessons() {
      return studyLessons;
    },
    get studyDomains() {
      return studyDomains;
    },
    get lessonTabs() {
      return lessonTabs;
    },
    get lessonHref() {
      return lessonHref;
    },
    get query() {
      return catalog.query;
    },
    set query(value) {
      catalog.query = value;
    },
    get sortBy() {
      return catalog.sortBy;
    },
    get sortDirection() {
      return catalog.sortDirection;
    },
    get domain() {
      return domain;
    },
    set domain(value) {
      domain = value;
    },
    get topic() {
      return topic;
    },
    set topic(value) {
      topic = value;
    },
    get studyView() {
      return studyView;
    },
    set studyView(value) {
      studyView = value;
    },
    get homeView() {
      return homeView;
    },
    set homeView(value) {
      homeView = value;
    },
    get selectedStudyLesson() {
      return selectedStudyLesson;
    },
    get navOpen() {
      return navOpen;
    },
    set navOpen(value) {
      navOpen = value;
    },
    get globalSearchOpen() {
      return globalSearchOpen;
    },
    set globalSearchOpen(value) {
      globalSearchOpen = value;
    },
    get globalSearchQuery() {
      return globalSearchQuery;
    },
    set globalSearchQuery(value) {
      globalSearchQuery = value;
    },
    get globalSearchInput() {
      return globalSearchInput;
    },
    set globalSearchInput(value) {
      globalSearchInput = value;
    },
    get activeSearchIndex() {
      return activeSearchIndex;
    },
    set activeSearchIndex(value) {
      activeSearchIndex = value;
    },
    get fullscreenActive() {
      return fullscreenActive;
    },
    set fullscreenActive(value) {
      fullscreenActive = value;
    },
    get heroVisible() {
      return heroVisible;
    },
    set heroVisible(value) {
      heroVisible = value;
    },
    get algorithmView() {
      return algorithmView;
    },
    set algorithmView(value) {
      algorithmView = value;
    },
    get shellGapSequence() {
      return shellGapSequence;
    },
    set shellGapSequence(value) {
      shellGapSequence = value;
    },
    get selectedGrowthModel() {
      return selectedGrowthModel;
    },
    get displayedAlgorithms() {
      return catalog.displayedAlgorithms;
    },
    get selectedAlgorithm() {
      return selectedAlgorithm;
    },
    get selectedLesson() {
      return selectedLesson;
    },
    get sortCatalog() {
      return catalog.sortCatalog;
    },
    get searchResults() {
      return searchResults;
    },
    get walkthroughUrl() {
      return walkthroughUrl;
    },
    get openPage() {
      return openPage;
    },
    get handleSearchKeydown() {
      return handleSearchKeydown;
    },
    get openSearchResult() {
      return openSearchResult;
    },
    get handleFrameShortcut() {
      return handleFrameShortcut;
    },
    get toggleFullscreen() {
      return toggleFullscreen;
    },
    get isActive() {
      return isActive;
    },
    get pageTitle() {
      return pageTitle;
    },
    get pageKicker() {
      return pageKicker;
    },
  };
}
