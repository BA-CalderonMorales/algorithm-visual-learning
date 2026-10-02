<script>
  import { onMount } from 'svelte';
  import { algorithms, visibleAlgorithms } from './algorithms.js';
  import { algorithmLessons } from './algorithm-lessons.js';
  import GrowthChart from './GrowthChart.svelte';
  import { getGrowthModel } from './growth-models.js';
  import WalkthroughFrame from './WalkthroughFrame.svelte';
  import ConceptFilm from './ConceptFilm.svelte';
  import { playFilms } from './play-models.js';
  import StudyLesson from './StudyLesson.svelte';
  import StudyLibrary from './StudyLibrary.svelte';
  import StudyTabs from './StudyTabs.svelte';
  import { studyLessons, studyDomains, lessonTabs, lessonHref } from './study-lessons.js';

  let query = $state('');
  let sortBy = $state('');
  let sortDirection = $state(1);
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
  let implementationSource = $state('');
  let pythonLoading = $state(false);
  let pythonError = $state('');
  let items = $derived(visibleAlgorithms(query));
  let catalogItems = $derived([...items].sort((a, b) => a.difficulty - b.difficulty));
  let displayedAlgorithms = $derived.by(() => {
    if (!sortBy) return catalogItems;
    return [...catalogItems].sort((a, b) => {
      const comparison = sortBy === 'divide'
        ? Number(a.divide.startsWith('Yes')) - Number(b.divide.startsWith('Yes'))
        : sortBy === 'difficulty'
          ? a.difficulty - b.difficulty
          : String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, { numeric: true, sensitivity: 'base' });
      return comparison * sortDirection;
    });
  });
  let selectedAlgorithm = $derived(algorithms.find((algorithm) => algorithm.id === selectedAlgorithmId));
  let selectedLesson = $derived(algorithmLessons[selectedAlgorithmId]);
  let highlightedLines = $derived(highlightCode(implementationSource, implementationLanguage));

  function sortCatalog(field) {
    if (sortBy === field) {
      if (sortDirection === 1) sortDirection = -1;
      else { sortBy = ''; sortDirection = 1; }
      return;
    }
    sortBy = field;
    sortDirection = 1;
  }

  const baseSearchEntries = [
    { title: 'Study home', group: 'Start here', description: 'A visual study guide for algorithms, discrete mathematics, and complexity.', href: '#/home', terms: 'learn study guide start overview' },
    { title: 'More learning resources', group: 'Start here', description: 'AlgoMaster, NeetCode, and free MIT OpenCourseWare courses.', href: '#/home/resources', terms: 'resources courses paid free external learning' },
    { title: 'A note from the author', group: 'Start here', description: 'Why this free, open-source study guide exists and how to contribute.', href: '#/home/author', terms: 'author about contribute open source MIT fork' },
    { title: 'Sorting algorithms', group: 'Algorithms', description: 'Browse and compare the sorting algorithm collection.', href: '#/algorithms/sorting', terms: 'sort catalogue sorting' },
    { title: 'Discrete mathematics', group: 'Learning domains', description: 'Choose a proof, sum, or recurrence to explore.', href: '#/discrete', terms: 'math proofs sums recurrences' },
    { title: 'Complexity', group: 'Learning domains', description: 'Choose time or space analysis.', href: '#/complexity', terms: 'time space work memory' },
    { title: 'Proof by induction', group: 'Discrete mathematics', description: 'Base case, inductive hypothesis, inductive step, and the bridge to the next case.', href: '#/discrete/induction', terms: 'proof base case hypothesis inductive step mathematical induction' },
    { title: 'Telescoping sums', group: 'Discrete mathematics', description: 'Rewrite terms as differences, cancel neighbors, and keep the endpoints.', href: '#/discrete/telescoping', terms: 'sum series cancellation endpoints partial fractions' },
    { title: 'Master theorem', group: 'Discrete mathematics', description: 'Classify divide-and-conquer recurrences with the standard cases.', href: '#/discrete/master-theorem', terms: 'recurrence divide conquer cases a b f(n) log' },
    { title: 'Time complexity', group: 'Complexity', description: 'Best, average, and worst cases; O, Ω, and Θ growth bounds.', href: '#/complexity/time', terms: 'runtime time big o omega theta growth asymptotic lower upper bound' },
    { title: 'Space complexity', group: 'Complexity', description: 'Total versus auxiliary memory, recursion stacks, and peak live storage.', href: '#/complexity/space', terms: 'memory space auxiliary total recursion stack' },
  ];
  const searchIndex = [
    ...baseSearchEntries,
    ...Object.values(studyLessons).flatMap(lesson => lessonTabs.map(tab => ({
      title: `${lesson.title} · ${tab.label}`, group: studyDomains[lesson.domain].title,
      description: tab.id === 'visualize' ? (playFilms[lesson.id]?.takeaway ?? lesson.intro) : lesson.intro,
      href: lessonHref(lesson, tab.id), terms: `${lesson.idea} ${lesson.caution} ${lesson.examples.map(example => example.title).join(' ')} ${tab.id}`,
    }))),
    ...algorithms.flatMap((algorithm) => {
      const lesson = algorithmLessons[algorithm.id];
      const context = [algorithm.cue, algorithm.extra, lesson?.idea, lesson?.invariant, lesson?.example, lesson?.watch, lesson?.practice, lesson?.answer, ...(lesson?.practiceChecks ?? []).flatMap((check) => [check.title, check.prompt, check.answer])].filter(Boolean).join(' ');
      return [
        { title: `${algorithm.name} · Understand`, group: 'Algorithms', description: `${algorithm.cue} ${lesson?.idea ?? ''} ${lesson?.watch ?? ''}`, href: `#/algorithms/${algorithm.id}/understand`, terms: context },
        { title: `${algorithm.name} · Step-by-step`, group: 'Algorithms', description: `Follow the ${algorithm.name} walkthrough one action at a time.`, href: `#/algorithms/${algorithm.id}/walkthrough`, terms: context },
        { title: `${algorithm.name} · Play`, group: 'Algorithms', description: playFilms[algorithm.id].takeaway, href: `#/algorithms/${algorithm.id}/play`, terms: `${context} animation film motion replay reverse` },
        { title: `${algorithm.name} · Implementations`, group: 'Algorithms', description: 'Simple Python, typed Python, JavaScript, and TypeScript code.', href: `#/algorithms/${algorithm.id}/python/simple`, terms: context },
        { title: `${algorithm.name} · Practice`, group: 'Algorithms', description: lesson?.practice ?? 'Practice the key decisions in this algorithm.', href: `#/algorithms/${algorithm.id}/practice`, terms: context },
        { title: `${algorithm.name} · Complexity`, group: 'Algorithms', description: `Best: ${lesson?.best ?? ''}; average: ${lesson?.average ?? ''}; worst: ${lesson?.worst ?? ''}; space: ${lesson?.space ?? ''}`, href: `#/algorithms/${algorithm.id}/complexity`, terms: `${context} ${lesson?.best ?? ''} ${lesson?.average ?? ''} ${lesson?.worst ?? ''} ${lesson?.space ?? ''} ${algorithm.lower} ${algorithm.upper}` },
        { title: `${algorithm.name} · Growth`, group: 'Algorithms', description: 'Compare theoretical best-, average-, and worst-case operation growth as input size increases.', href: `#/algorithms/${algorithm.id}/growth`, terms: `${context} growth operation count dominant case theoretical chart` },
      ];
    }),
  ];
  let searchResults = $derived.by(() => {
    const terms = globalSearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return baseSearchEntries.slice(0, 6);
    return searchIndex.map((entry) => {
      const haystack = `${entry.title} ${entry.group} ${entry.description} ${entry.terms}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce((sum, term) => sum + (entry.title.toLowerCase().includes(term) ? 4 : entry.description.toLowerCase().includes(term) ? 2 : 1), 0);
      return { ...entry, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
  });

  const pythonTokenPattern = /(?<triple>"""[\s\S]*?"""|'''[\s\S]*?''')|(?<comment>\#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>\b(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\b)|(?<constant>\b(?:True|False|None)\b)|(?<keyword>\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(?<builtin>\b(?:bool|dict|enumerate|filter|float|int|isinstance|len|list|map|max|min|print|range|reversed|set|sorted|str|sum|tuple|type|zip|super|property|staticmethod|classmethod)\b)|(?<operator>[-+*/%=<>!&|^~]+)|(?<punct>[()[\]{}.,:;])|(?<space>\s)|(?<identifier>[A-Za-z_]\w*)|(?<other>.)/g;

  function highlightCode(source, language) {
    const isPython = language.startsWith('python');
    const tokens = isPython ? pythonTokenPattern : /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>\b\d+(?:\.\d+)?\b)|(?<constant>\b(?:true|false|null|undefined)\b)|(?<keyword>\b(?:as|async|await|break|case|catch|class|const|continue|default|else|export|extends|for|from|function|if|import|interface|let|new|of|return|static|throw|try|type|typeof|var|while)\b)|(?<builtin>\b(?:Array|Boolean|console|Error|Map|Math|Number|Object|Set|String)\b)|(?<operator>[-+*/%=<>!&|^~?:]+)|(?<punct>[()[\]{}.,;])|(?<space>\s)|(?<identifier>[A-Za-z_$][\w$]*)|(?<other>.)/g;
    const lines = [[]];
    for (const match of source.matchAll(tokens)) {
      const type = Object.keys(match.groups).find((key) => match.groups[key] !== undefined) ?? 'other';
      const chunks = match[0].split('\n');
      chunks.forEach((text, index) => {
        if (text) lines[lines.length - 1].push({ text, type });
        if (index < chunks.length - 1) lines.push([]);
      });
    }
    return lines;
  }

  const returnToTop = () => requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));

  const loadImplementation = async (algorithm, language) => {
    pythonError = '';
    pythonLoading = true;
    try {
      const files = { 'python-simple': algorithm.simplePython, 'python-typed': algorithm.python, javascript: algorithm.javascript, typescript: algorithm.typescript };
      const sourceUrl = new URL(`${import.meta.env.BASE_URL}walkthroughs/${files[language]}`, window.location.href);
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Could not load the implementation (${response.status}).`);
      const source = await response.text();
      if (response.headers.get('content-type')?.includes('text/html')) {
        throw new Error('The implementation URL returned the site page instead of source code. Check the site base path.');
      }
      implementationSource = source;
    } catch (error) {
      pythonError = error.message || 'Could not load this implementation.';
    } finally {
      pythonLoading = false;
    }
  };

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
    '#/complexity/space': ['complexity', 'space'],
  };

  const openPage = (nextDomain, nextTopic) => {
    domain = nextDomain;
    topic = nextTopic;
    studyView = 'understand';
    selectedAlgorithmId = '';
    query = '';
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
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const syncFullscreen = () => (fullscreenActive = Boolean(document.fullscreenElement));
    window.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('fullscreenchange', syncFullscreen);
    const applyRoute = () => {
      const algorithmRoute = window.location.hash.match(/^#\/algorithms\/([^/]+)\/(understand|play|walkthrough|practice|complexity|growth|python(?:\/(?:simple|typed))?|javascript|typescript)$/);
      if (algorithmRoute) {
        const algorithm = algorithms.find((entry) => entry.id === decodeURIComponent(algorithmRoute[1]));
        if (algorithm) {
          const switchingViewForSameAlgorithm =
            domain === 'algorithms' && topic === 'algorithm' && selectedAlgorithmId === algorithm.id;
          domain = 'algorithms';
          topic = 'algorithm';
          selectedAlgorithmId = algorithm.id;
          const view = algorithmRoute[2];
          algorithmView = ['understand', 'play', 'walkthrough', 'practice', 'complexity', 'growth'].includes(view) ? view : 'implementation';
          implementationLanguage = view === 'javascript' || view === 'typescript' ? view : view === 'python/typed' ? 'python-typed' : 'python-simple';
          navOpen = false;
          if (!switchingViewForSameAlgorithm) returnToTop();
          if (algorithmView === 'implementation') void loadImplementation(algorithm, implementationLanguage);
          return;
        }
      }
      const studyRoute = window.location.hash.match(/^#\/(discrete|complexity)\/([^/]+)(?:\/(understand|visualize|examples|practice))?$/);
      if (studyRoute) {
        const lesson = Object.values(studyLessons).find(entry => entry.domain === studyRoute[1] && entry.slug === studyRoute[2]);
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
      homeView = window.location.hash === '#/home/resources' ? 'resources' : window.location.hash === '#/home/author' ? 'author' : 'explore';
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
    domain === 'algorithms' ? (topic === 'algorithm' ? selectedAlgorithm?.name ?? 'Algorithm' : 'Algorithms') :
    domain === 'discrete' ? (selectedStudyLesson?.title ?? 'Discrete mathematics') :
    domain === 'complexity' ? ({ time: 'Time complexity', space: 'Space complexity' }[topic] ?? 'Complexity') :
    'A visual DSA study guide',
  );

  const pageKicker = $derived(
    domain === 'algorithms' ? 'Algorithms · interactive walkthroughs' :
    domain === 'discrete' ? 'Discrete math · build the reasoning' :
    domain === 'complexity' ? 'Complexity · analyze the resources' :
    'A growing companion for data structures & algorithms',
  );
</script>

<svelte:head>
  <title>{pageTitle} · DSA Study Studio</title>
  <meta name="description" content="A visual, step-by-step study guide for algorithms, discrete mathematics, and time and space complexity." />
</svelte:head>

<div class="app-frame">
  {#if navOpen}<button class="nav-scrim" aria-label="Close navigation" onclick={() => (navOpen = false)}></button>{/if}
  <aside class:nav-open={navOpen} class="sidebar" aria-label="Study guide navigation" aria-hidden={!navOpen}>
    <a class="brand" href="#/home" onclick={() => openPage('overview', 'home')}>
      <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
      <span><strong>DSA Study Studio</strong><small>See the idea. Follow the why.</small></span>
    </a>

    <button class:active={domain === 'overview'} class="nav-link home-link" onclick={() => openPage('overview', 'home')}>
      <span class="nav-icon">⌂</span> Study home
    </button>

    <nav>
      <p class="nav-group-title">Algorithms</p>
      <button class:active={domain === 'algorithms'} class="nav-link" onclick={() => openPage('algorithms', 'catalog')}>
        <span class="nav-icon">↗</span> Sorting algorithms <span class="nav-count">7</span>
      </button>

      <p class="nav-group-title">Discrete mathematics</p>
      <a class="nav-link" class:active={isActive('discrete', 'index')} href="#/discrete" onclick={() => (navOpen = false)}><span class="nav-icon">∑</span> All math topics</a>
      <button class:active={isActive('discrete', 'induction')} class="nav-link" onclick={() => openPage('discrete', 'induction')}>
        <span class="nav-icon">∴</span> Proof by induction
      </button>
      <button class:active={isActive('discrete', 'telescoping')} class="nav-link" onclick={() => openPage('discrete', 'telescoping')}>
        <span class="nav-icon">∑</span> Telescoping sums
      </button>
      <button class:active={isActive('discrete', 'master')} class="nav-link" onclick={() => openPage('discrete', 'master')}>
        <span class="nav-icon">T</span> Master theorem
      </button>

      <p class="nav-group-title">Complexity</p>
      <a class="nav-link" class:active={isActive('complexity', 'index')} href="#/complexity" onclick={() => (navOpen = false)}><span class="nav-icon">◷</span> Time and space</a>
      <button class:active={isActive('complexity', 'time')} class="nav-link" onclick={() => openPage('complexity', 'time')}>
        <span class="nav-icon">◷</span> Time complexity
      </button>
      <button class:active={isActive('complexity', 'space')} class="nav-link" onclick={() => openPage('complexity', 'space')}>
        <span class="nav-icon">▱</span> Space complexity
      </button>

      <p class="nav-group-title">Contribute</p>
      <a class="nav-link contribute-link" href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
        <span class="nav-icon">＋</span> How to contribute
      </a>
    </nav>

    <div class="sidebar-note"><span class="note-dot"></span><span>Made for curious minds<br />and the next class, too.</span></div>
  </aside>

  <div class="content-column">
    <header class="topbar">
      <div class="topbar-leading">
        <button class="nav-toggle" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={navOpen} onclick={() => (navOpen = !navOpen)}>{navOpen ? '×' : '☰'}</button>
        <div class="breadcrumbs"><span>Learning library</span><span class="crumb-separator">/</span><strong>{pageTitle}</strong></div>
      </div>
      <div class="topbar-actions">
        <button class="fullscreen-toggle" aria-label={fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'} onclick={toggleFullscreen}>
          {#if fullscreenActive}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3v4H3M13 3v4h4M7 17v-4H3m10 4v-4h4"></path></svg>{:else}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7V3h4M17 7V3h-4M3 13v4h4m10-4v4h-4"></path></svg>{/if}
        </button>
        <button class="global-search-trigger" aria-label="Search topics (Ctrl+K)" onclick={() => { activeSearchIndex = 0; globalSearchOpen = true; requestAnimationFrame(() => globalSearchInput?.focus()); }}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"></circle><path d="m13 13 4 4"></path></svg>
          <span>Search topics</span><kbd>Ctrl K</kbd>
        </button>
        <a class="repository-link" href="https://github.com/BA-CalderonMorales/algorithm-visual-learning" target="_blank" rel="noopener noreferrer" aria-label="View the project on GitHub">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.7a8.3 8.3 0 0 0-2.63 16.18c.42.08.57-.18.57-.4v-1.55c-2.32.5-2.81-.98-2.81-.98-.38-.96-.93-1.22-.93-1.22-.76-.52.06-.51.06-.51.84.06 1.28.86 1.28.86.75 1.28 1.96.91 2.44.7.08-.54.29-.91.53-1.12-1.85-.21-3.79-.93-3.79-4.12 0-.91.33-1.65.86-2.24-.09-.21-.37-1.06.08-2.2 0 0 .7-.22 2.29.86a7.95 7.95 0 0 1 4.17 0c1.59-1.08 2.29-.86 2.29-.86.45 1.14.17 1.99.08 2.2.54.59.86 1.33.86 2.24 0 3.2-1.94 3.9-3.8 4.11.3.26.57.77.57 1.55v2.28c0 .22.15.48.58.4A8.3 8.3 0 0 0 10 1.7Z"></path></svg>
          <span>GitHub</span><span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>

    <div class="domain-tabs" aria-label="Learning domains">
      <button class:active={domain === 'algorithms'} onclick={() => openPage('algorithms', 'catalog')}>Algorithms</button>
      <button class:active={domain === 'discrete'} onclick={() => openPage('discrete', 'index')}>Discrete math</button>
      <button class:active={domain === 'complexity'} onclick={() => openPage('complexity', 'index')}>Complexity</button>
    </div>

    <main class="page-content" class:wide-algorithm-page={domain === 'algorithms' && topic === 'algorithm'}>
      {#if domain === 'overview'}
        <StudyLibrary libraryDomain="home" view={homeView} bind:heroVisible />

      {:else if domain === 'algorithms' && topic === 'catalog'}
        <section class="page-hero compact-hero">
          <p class="eyebrow">{pageKicker}</p>
          <h1>Sorting, one move at a time.</h1>
          <p class="intro">See the array change, read why each move happens, then compare beginner-friendly and typed implementations across languages.</p>
        </section>
        <section class="catalog" aria-labelledby="catalog-title">
          <div class="catalog-heading"><div><p class="eyebrow">The collection</p><h2 id="catalog-title">Compare the sorting algorithms</h2><p class="catalog-intro">Difficulty is a learning estimate (1 = gentlest, 7 = most involved). Choose a column heading to sort.</p></div>
            <label class="search"><span>Filter</span><input bind:value={query} placeholder="Try ‘divide and conquer’" /></label>
          </div>
          <div class="catalog-table-wrap">
            <table class="catalog-table">
              <thead><tr>
                <th scope="col" aria-sort={sortBy === 'name' ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'}><button class="sort-button" onclick={() => sortCatalog('name')}>Algorithm <span aria-hidden="true">{sortBy === 'name' ? (sortDirection === 1 ? '↑' : '↓') : '↕'}</span></button></th>
                <th scope="col" aria-sort={sortBy === 'difficulty' ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'}><button class="sort-button" onclick={() => sortCatalog('difficulty')}>Difficulty <span aria-hidden="true">{sortBy === 'difficulty' ? (sortDirection === 1 ? '↑' : '↓') : '↕'}</span></button></th>
                <th scope="col">Core idea</th>
                <th scope="col" aria-sort={sortBy === 'divide' ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'}><button class="sort-button" onclick={() => sortCatalog('divide')}>Divide &amp; conquer <span aria-hidden="true">{sortBy === 'divide' ? (sortDirection === 1 ? '↑' : '↓') : '↕'}</span></button></th>
                <th scope="col" aria-sort={sortBy === 'lower' ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'}><button class="sort-button" onclick={() => sortCatalog('lower')}>Lower bound <span aria-hidden="true">{sortBy === 'lower' ? (sortDirection === 1 ? '↑' : '↓') : '↕'}</span></button></th>
                <th scope="col" aria-sort={sortBy === 'upper' ? (sortDirection === 1 ? 'ascending' : 'descending') : 'none'}><button class="sort-button" onclick={() => sortCatalog('upper')}>Upper bound <span aria-hidden="true">{sortBy === 'upper' ? (sortDirection === 1 ? '↑' : '↓') : '↕'}</span></button></th>
                <th scope="col"><span class="visually-hidden">Study links</span></th>
              </tr></thead>
              <tbody>
            {#each displayedAlgorithms as algorithm (algorithm.id)}
              <tr>
                <th scope="row" data-label="Algorithm"><a class="catalog-algorithm-link" href="#/algorithms/{algorithm.id}/understand">{algorithm.name}<span aria-hidden="true">↗</span></a></th>
                <td data-label="Difficulty"><span class="difficulty-rating" aria-label="Difficulty {algorithm.difficulty} out of 7">{algorithm.difficulty}<small>/7</small></span></td>
                <td data-label="Core idea"><span class="catalog-cue">{algorithm.cue}</span><span class="catalog-note">{algorithm.extra}</span></td>
                <td data-label="Divide &amp; conquer"><span class:yes={algorithm.divide.startsWith('Yes')} class="dnc">{algorithm.divide}</span></td>
                <td data-label="Lower bound" class="catalog-bound">{algorithm.lower}</td>
                <td data-label="Upper bound" class="catalog-bound">{algorithm.upper}</td>
                <td data-label="Study links"><div class="catalog-actions"><a class="catalog-step-link" href="#/algorithms/{algorithm.id}/walkthrough">Trace steps</a><a class="catalog-code-link" href="#/algorithms/{algorithm.id}/python">Python</a></div></td>
              </tr>
            {:else}<tr><td colspan="7"><p class="empty">No matches. Try a sort name or a memory cue.</p></td></tr>{/each}
              </tbody>
            </table>
          </div>
          <p class="section-footnote">These are quick per-algorithm reminders. The <button class="inline-link" onclick={() => openPage('complexity', 'time')}>Complexity domain</button> teaches how to analyze bounds and cases in general.</p>
        </section>
      {:else if domain === 'algorithms' && topic === 'algorithm' && selectedAlgorithm}
        {#if heroVisible}
          <section class="page-hero compact-hero algorithm-hero">
            <a class="back-link" href="#/algorithms/sorting">← All sorting algorithms</a>
            <p class="eyebrow">Algorithm walkthrough · code references</p>
            <h1>{selectedAlgorithm.name}</h1>
            {#if selectedAlgorithm.id === 'quick'}
              <p class="intro">Follow the partition, then decide whether each side recurses or uses insertion sort.</p>
            {:else}
              <p class="intro">{selectedAlgorithm.cue} Start with the simple version, then compare typed Python, JavaScript, and TypeScript.</p>
            {/if}
            <button class="hero-visibility-toggle" onclick={() => heroVisible = false}>Hide intro <span aria-hidden="true">⌃</span></button>
          </section>
        {:else}
          <div class="hero-collapsed-strip"><span>{selectedAlgorithm.name}</span><button class="hero-visibility-toggle" onclick={() => heroVisible = true}>Show intro <span aria-hidden="true">⌄</span></button></div>
        {/if}
        <section class="algorithm-view standalone-view" class:play-view={algorithmView === 'play'} aria-label="{selectedAlgorithm.name} materials">
          <StudyTabs tabs={[['understand','Understand'],['play','Play'],['walkthrough','Step-by-step'],['implementation','Implementations'],['practice','Practice'],['complexity','Complexity'],['growth','Growth']].map(([id,label]) => ({ id, label, href:`#/algorithms/${selectedAlgorithm.id}/${id === 'implementation' ? 'python/simple' : id}` }))} selected={algorithmView} label="{selectedAlgorithm.name} learning materials" idPrefix="algorithm-tab" />
          {#if algorithmView === 'walkthrough'}
            {#key selectedAlgorithm.id}
              <WalkthroughFrame name={selectedAlgorithm.name} src={walkthroughUrl(selectedAlgorithm)} onShortcut={handleFrameShortcut} />
            {/key}
          {/if}
          {#if algorithmView === 'play'}
            {#key selectedAlgorithm.id}<ConceptFilm film={playFilms[selectedAlgorithm.id]} />{/key}
          {:else if algorithmView === 'understand'}
            <section class="learning-view understand-view" aria-labelledby="understand-title">
              <header class="understand-intro">
                <div class="understand-heading"><p class="eyebrow">The core idea</p><h2 id="understand-title">What {selectedAlgorithm.name} is doing</h2></div>
                <p class="learning-lead">{selectedLesson.idea}</p>
              </header>
              <div class="understand-grid" aria-label="How to reason through {selectedAlgorithm.name}">
                <article class="understand-point invariant-point"><span class="understand-index">01</span><div><span class="learning-label">What stays true</span><p>{selectedLesson.invariant}</p></div></article>
                <article class="understand-point"><span class="understand-index">02</span><div><span class="learning-label">What to watch</span><p>{selectedLesson.watch}</p></div></article>
                <article class="understand-point example-point"><span class="understand-index">03</span><div><span class="learning-label">A small example</span><p>{selectedLesson.example}</p></div></article>
              </div>
              {#if selectedAlgorithm.id === 'quick'}
                <article class="worked-example reasoning-card">
                  <div class="example-head"><span>Read a partition like an exam trace</span><span class="example-tag">Pivot = 4</span></div>
                  <p class="reasoning-intro">Use Worksheet A: <code>[4, 7, 8, 2, 9, 5, 6, 3, 1]</code>. The sample values are 4, 9, and 1, so the median is 4. Order those samples, then move the median to high − 1:</p>
                  <div class="trace-state"><span>Before scans</span><code>[1, 7, 8, 2, 3, 5, 6, <b>4</b>, 9]</code><small>Pivot 4 is at index 7. The minimum 1 and maximum 9 are sentinels at the ends.</small></div>
                  <ol class="reasoning-steps">
                    <li><b>Scan I from the left.</b><span>I starts after the left sentinel. It stops at 7 because 7 is not below pivot 4.</span></li>
                    <li><b>Scan J from the right.</b><span>J passes 6 and 5 because they are above 4. It stops at 3 because 3 is not above the pivot.</span></li>
                    <li><b>Swap the stopped values.</b><span>7 and 3 trade places; I and J stay at their indices. Next, I stops at 8 and J stops at 2, so those values trade places.</span></li>
                    <li><b>Finish when the pointers cross.</b><span>The scan boundary is index 3. Swap the pivot with the value at I (8), placing 4 in its final position.</span></li>
                  </ol>
                  <div class="trace-result"><span>Partition checkpoint</span><code>[1, 3, 2] &nbsp;|&nbsp; <b>4</b> &nbsp;|&nbsp; [7, 5, 6, 8, 9]</code><small>S1 contains values ≤ 4, S2 contains values ≥ 4, and the pivot is now fixed. Sort each side independently.</small></div>
                  <p class="caution"><strong>Pointer reminder:</strong> a swap moves array values, not I or J. The final pivot swap happens only after I and J cross.</p>
                </article>
              {/if}
              <a class="primary learning-link" href="#/algorithms/{selectedAlgorithm.id}/walkthrough">Now follow a step-by-step trace →</a>
            </section>
          {:else if algorithmView === 'practice'}
            <section class="learning-view practice-view" aria-labelledby="practice-title">
              <p class="eyebrow">Retrieve it from memory</p>
              <h2 id="practice-title">Predict before you reveal</h2>
              {#if selectedLesson.practiceChecks}
                <p class="practice-intro">Work through the same four decisions you make in the algorithm: choose, scan, swap, then split.</p>
                <div class="practice-check-grid">
                  {#each selectedLesson.practiceChecks as check}
                    <article class="practice-check-card">
                      <h3>{check.title}</h3>
                      <p class="practice-prompt">{check.prompt}</p>
                      <details class="answer-reveal"><summary>Reveal the reasoning</summary><p>{check.answer}</p></details>
                    </article>
                  {/each}
                </div>
              {:else}
                <p class="practice-prompt">{selectedLesson.practice}</p>
                <details class="answer-reveal"><summary>Show the reasoning</summary><p>{selectedLesson.answer}</p></details>
              {/if}
              <a class="secondary learning-link" href="#/algorithms/{selectedAlgorithm.id}/walkthrough">Return to the walkthrough →</a>
            </section>
          {:else if algorithmView === 'complexity'}
            <section class="learning-view complexity-view" aria-labelledby="algorithm-complexity-title">
              <p class="eyebrow">Connect the work to the bound</p>
              <h2 id="algorithm-complexity-title">Time and space</h2>
              {#if selectedAlgorithm.id === 'shell'}
                <label class="growth-select">Gap sequence
                  <select bind:value={shellGapSequence} aria-label="Shell Sort gap sequence">
                    <option value="halving">Halving: n/2, n/4, …, 1</option>
                    <option value="knuth">Knuth: 1, 4, 13, …</option>
                  </select>
                </label>
              {/if}
              <div class="case-grid algorithm-case-grid">
                {#each Object.entries(selectedGrowthModel.cases) as [key, definition]}
                  <article><span class="case-label">{key === 'best' ? 'Best case' : key === 'average' ? 'Average case' : 'Worst case'}</span><p><strong>{definition.bound}</strong></p><p>{definition.assumption}</p></article>
                {/each}
              </div>
              <div class="complexity-facts" aria-label="Algorithmic bounds and approach">
                <article class="learning-card"><span class="learning-label">Divide and conquer</span><p>{selectedAlgorithm.divide}</p></article>
                <article class="learning-card"><span class="learning-label">Runtime lower bound</span><p>{selectedAlgorithm.id === 'shell' && shellGapSequence === 'knuth' ? 'Ω(n log n), sorted input with Knuth gaps' : selectedAlgorithm.lower}</p></article>
                <article class="learning-card"><span class="learning-label">Runtime upper bound</span><p>{selectedAlgorithm.id === 'shell' && shellGapSequence === 'knuth' ? 'O(n^1.5), Knuth gaps' : selectedAlgorithm.upper}</p></article>
              </div>
              <article class="learning-card space-card"><span class="learning-label">Auxiliary space</span><p>{selectedLesson.space}</p></article>
              <p class="complexity-note">{selectedLesson.note}</p>
              <p class="complexity-note">{selectedGrowthModel.note}</p>
              <a class="secondary learning-link" href="#/algorithms/{selectedAlgorithm.id}/growth">See these same cases on the Growth chart →</a>
              {#if selectedAlgorithm.id === 'quick'}<p class="complexity-note">{selectedAlgorithm.extra}</p>{/if}
            </section>
          {:else if algorithmView === 'growth'}
            <GrowthChart algorithmId={selectedAlgorithm.id} algorithmName={selectedAlgorithm.name} bind:gapSequence={shellGapSequence} />
          {:else if algorithmView === 'implementation' && pythonLoading}
            <p class="code-status">Loading the implementation…</p>
          {:else if algorithmView === 'implementation' && pythonError}
            <p class="code-status error">{pythonError}</p>
          {:else if algorithmView === 'implementation'}
            <StudyTabs tabs={[['python-simple','Python (simple)','python/simple'],['python-typed','Python (typed)','python/typed'],['javascript','JavaScript','javascript'],['typescript','TypeScript','typescript']].map(([id,label,path]) => ({ id,label,href:`#/algorithms/${selectedAlgorithm.id}/${path}` }))} selected={implementationLanguage} label="Choose implementation language" idPrefix="code-tab" />
            <div class="code-language-label">{implementationLanguage === 'python-simple' ? 'Python · intuition-first' : implementationLanguage === 'python-typed' ? 'Python · typed reference' : implementationLanguage === 'javascript' ? 'JavaScript · implementation' : 'TypeScript · typed implementation'}</div>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div class="python-code" role="region" aria-label="{selectedAlgorithm.name} {implementationLanguage} source" tabindex="0"><pre>{#each highlightedLines as line, index}<span class="code-line"><span class="line-number" aria-hidden="true">{index + 1}</span><code>{#each line as token}<span class="token-{token.type}">{token.text}</span>{/each}{#if line.length === 0}<span aria-hidden="true"> </span>{/if}</code></span>{/each}</pre></div>
          {/if}
        </section>

      {:else if (domain === 'discrete' || domain === 'complexity') && topic === 'index'}
        <StudyLibrary libraryDomain={domain} bind:heroVisible />
      {:else if (domain === 'discrete' || domain === 'complexity') && selectedStudyLesson}
        {#if heroVisible}
          <section class="page-hero compact-hero study-page-heading">
            <a class="study-back" href="#/{domain}">← {studyDomains[domain].title}</a>
            <h1>{selectedStudyLesson.title}</h1>
            <p class="intro">{selectedStudyLesson.intro}</p>
            <button class="hero-visibility-toggle" onclick={() => heroVisible = false}>Hide intro <span aria-hidden="true">⌃</span></button>
          </section>
        {:else}
          <div class="hero-collapsed-strip"><span>{selectedStudyLesson.title}</span><button class="hero-visibility-toggle" onclick={() => heroVisible = true}>Show intro <span aria-hidden="true">⌄</span></button></div>
        {/if}
        {#key selectedStudyLesson.id}<StudyLesson lesson={selectedStudyLesson} view={studyView} />{/key}
      {/if}
    </main>
    <footer class="site-footer"><span>DSA Study Studio</span><span>Clear steps · careful reasoning · keep learning</span></footer>
  </div>
</div>

{#if globalSearchOpen}
  <div class="search-overlay" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) globalSearchOpen = false; }}>
    <dialog open class="site-search" aria-modal="true" aria-labelledby="site-search-title">
      <h2 id="site-search-title" class="visually-hidden">Search the study guide</h2>
      <div class="site-search-field">
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"></circle><path d="m13 13 4 4"></path></svg>
        <input type="search" bind:this={globalSearchInput} bind:value={globalSearchQuery} oninput={() => (activeSearchIndex = 0)} onkeydown={handleSearchKeydown} placeholder="Search algorithms, proofs, complexity…" aria-label="Search topics" aria-controls="site-search-results" aria-activedescendant={searchResults[activeSearchIndex] ? `search-result-${activeSearchIndex}` : undefined} />
        <kbd>ESC</kbd>
      </div>
      <div id="site-search-results" class="site-search-results" role="listbox" aria-label="Search results">
        {#each searchResults as result, index (result.href + result.title)}
          <a id="search-result-{index}" class:search-result-active={index === activeSearchIndex} class="site-search-result" role="option" aria-selected={index === activeSearchIndex} href={result.href} onclick={(event) => { event.preventDefault(); openSearchResult(result); }} onmouseenter={() => (activeSearchIndex = index)}>
            <span class="search-result-copy"><strong>{result.title}</strong><small>{result.description}</small></span>
            <span class="search-result-group">{result.group}</span>
          </a>
        {:else}
          <p class="site-search-empty">No matching topics. Try a concept like “pivot”, “induction”, or “space”.</p>
        {/each}
      </div>
      <div class="site-search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>Enter</kbd> to open</span><span>Search lessons and algorithms</span></div>
    </dialog>
  </div>
{/if}
