<script>
  import { onMount } from 'svelte';
  import { algorithms, visibleAlgorithms } from './algorithms.js';

  let query = $state('');
  let domain = $state('overview');
  let topic = $state('home');
  let navOpen = $state(false);
  let selectedAlgorithmId = $state('');
  let algorithmView = $state('walkthrough');
  let pythonSource = $state('');
  let pythonLoading = $state(false);
  let pythonError = $state('');
  let items = $derived(visibleAlgorithms(query));
  let selectedAlgorithm = $derived(algorithms.find((algorithm) => algorithm.id === selectedAlgorithmId));

  const selectAlgorithm = async (algorithm, view = 'walkthrough') => {
    selectedAlgorithmId = algorithm.id;
    algorithmView = view;
    pythonError = '';
    if (view !== 'python') return;
    pythonLoading = true;
    try {
      const response = await fetch(`./walkthroughs/${algorithm.python}`);
      if (!response.ok) throw new Error(`Could not load the implementation (${response.status}).`);
      pythonSource = await response.text();
    } catch (error) {
      pythonError = error.message || 'Could not load this Python implementation.';
    } finally {
      pythonLoading = false;
    }
  };

  const routeTopics = {
    '#/home': ['overview', 'home'],
    '#/algorithms/sorting': ['algorithms', 'catalog'],
    '#/discrete/induction': ['discrete', 'induction'],
    '#/discrete/telescoping': ['discrete', 'telescoping'],
    '#/discrete/master-theorem': ['discrete', 'master'],
    '#/complexity/time': ['complexity', 'time'],
    '#/complexity/space': ['complexity', 'space'],
  };

  const openPage = (nextDomain, nextTopic) => {
    domain = nextDomain;
    topic = nextTopic;
    query = '';
    navOpen = false;
    const route = Object.entries(routeTopics).find(([, page]) => page[0] === nextDomain && page[1] === nextTopic)?.[0];
    if (route && window.location.hash !== route) window.location.hash = route;
  };

  onMount(() => {
    const applyRoute = () => {
      const [nextDomain, nextTopic] = routeTopics[window.location.hash] ?? routeTopics['#/home'];
      domain = nextDomain;
      topic = nextTopic;
    };
    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    return () => window.removeEventListener('hashchange', applyRoute);
  });

  const isActive = (nextDomain, nextTopic) => domain === nextDomain && topic === nextTopic;

  const pageTitle = $derived(
    domain === 'algorithms' ? 'Algorithms' :
    domain === 'discrete' ? ({ induction: 'Proof by induction', telescoping: 'Telescoping sums', master: 'Master theorem' }[topic] ?? 'Discrete mathematics') :
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
      <button class:active={isActive('algorithms', 'catalog')} class="nav-link" onclick={() => openPage('algorithms', 'catalog')}>
        <span class="nav-icon">↗</span> Sorting algorithms <span class="nav-count">7</span>
      </button>

      <p class="nav-group-title">Discrete mathematics</p>
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
      <button class:active={isActive('complexity', 'time')} class="nav-link" onclick={() => openPage('complexity', 'time')}>
        <span class="nav-icon">◷</span> Time complexity
      </button>
      <button class:active={isActive('complexity', 'space')} class="nav-link" onclick={() => openPage('complexity', 'space')}>
        <span class="nav-icon">▱</span> Space complexity
      </button>
    </nav>

    <div class="sidebar-note"><span class="note-dot"></span><span>Made for curious minds<br />and the next class, too.</span></div>
  </aside>

  <div class="content-column">
    <header class="topbar">
      <div class="topbar-leading">
        <button class="nav-toggle" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={navOpen} onclick={() => (navOpen = !navOpen)}>{navOpen ? '×' : '☰'}</button>
        <div class="breadcrumbs"><span>Learning library</span><span class="crumb-separator">/</span><strong>{pageTitle}</strong></div>
      </div>
      <span class="topbar-status"><span class="status-dot"></span> A study guide in progress</span>
    </header>

    <div class="domain-tabs" aria-label="Learning domains">
      <button class:active={domain === 'algorithms'} onclick={() => openPage('algorithms', 'catalog')}>Algorithms</button>
      <button class:active={domain === 'discrete'} onclick={() => openPage('discrete', 'induction')}>Discrete math</button>
      <button class:active={domain === 'complexity'} onclick={() => openPage('complexity', 'time')}>Complexity</button>
    </div>

    <main class="page-content">
      {#if domain === 'overview'}
        <section class="page-hero home-hero">
          <p class="eyebrow">{pageKicker}</p>
          <h1>Learn the moves.<br /><span>Understand the reason.</span></h1>
          <p class="intro">A calm, visual place to work through DSA ideas—not just memorize the final answer. Follow each step, inspect examples, and build the reasoning you can explain on an exam.</p>
        </section>
        <section class="domain-grid" aria-label="Study domains">
          <button class="domain-card algorithm-domain" onclick={() => openPage('algorithms', 'catalog')}>
            <span class="domain-icon">↗</span><span class="domain-label">01 · Algorithms</span><strong>Watch the data move.</strong><span>Interactive walkthroughs, matching Python implementations, and per-algorithm runtime notes.</span><i>Explore algorithms →</i>
          </button>
          <button class="domain-card math-domain" onclick={() => openPage('discrete', 'induction')}>
            <span class="domain-icon">∑</span><span class="domain-label">02 · Discrete mathematics</span><strong>Make the proof click.</strong><span>Induction, telescoping sums, and recurrences explained with worked examples.</span><i>Explore the math →</i>
          </button>
          <button class="domain-card complexity-domain" onclick={() => openPage('complexity', 'time')}>
            <span class="domain-icon">◷</span><span class="domain-label">03 · Complexity</span><strong>Reason about resources.</strong><span>Learn time and space analysis as concepts, separate from the quick notes on algorithm cards.</span><i>Explore complexity →</i>
          </button>
        </section>
        <section class="welcome-panel">
          <div><p class="eyebrow">A useful habit</p><h2>Trace it. Explain it. Then prove it.</h2></div>
          <p>When a step feels surprising, pause and ask: what did we know before it, what changed, and why is that change safe? This guide is built to make those answers visible.</p>
        </section>

      {:else if domain === 'algorithms'}
        <section class="page-hero compact-hero">
          <p class="eyebrow">{pageKicker}</p>
          <h1>Sorting, one move at a time.</h1>
          <p class="intro">See the array change, read why each move happens, then open the Python version alongside it.</p>
          <div class="memory-cue"><span class="cue-label">Quick recall</span><span>Quick / Merge / Tim split or merge ranges</span><span>Insertion grows a sorted prefix</span><span>Selection chooses the next minimum</span><span>Shell narrows its gaps</span><span>Counting turns frequencies into positions</span></div>
        </section>
        <section class="catalog" aria-labelledby="catalog-title">
          <div class="catalog-heading"><div><p class="eyebrow">The collection</p><h2 id="catalog-title">Choose an algorithm</h2></div>
            <label class="search"><span>Filter</span><input bind:value={query} placeholder="Try ‘divide and conquer’" /></label>
          </div>
          <div class="cards">
            {#each items as algorithm (algorithm.id)}
              <article class="card">
                <div class="card-top"><h3>{algorithm.name}</h3><span class:yes={algorithm.divide.startsWith('Yes')} class="dnc">D&C: {algorithm.divide}</span></div>
                <p class="cue">{algorithm.cue}</p>
                <dl class="bounds"><div><dt>Runtime lower bound</dt><dd>{algorithm.lower}</dd></div><div><dt>Runtime upper bound</dt><dd>{algorithm.upper}</dd></div></dl>
                <p class="extra">{algorithm.extra}</p>
                <div class="actions"><button class="primary" onclick={() => selectAlgorithm(algorithm, 'walkthrough')}>Step-by-step</button><button class="secondary" onclick={() => selectAlgorithm(algorithm, 'python')}>Python implementation</button></div>
              </article>
            {:else}<p class="empty">No matches. Try a sort name or a memory cue.</p>{/each}
          </div>
          {#if selectedAlgorithm}
            <section class="algorithm-view" aria-label="{selectedAlgorithm.name} materials">
              <div class="algorithm-view-heading"><div><p class="eyebrow">{selectedAlgorithm.name}</p><h2>Learn it, then inspect the code.</h2></div><button class="close-view" onclick={() => (selectedAlgorithmId = '')} aria-label="Close algorithm view">×</button></div>
              <div class="material-tabs" role="tablist" aria-label="{selectedAlgorithm.name} learning materials">
                <button role="tab" aria-selected={algorithmView === 'walkthrough'} class:active={algorithmView === 'walkthrough'} onclick={() => selectAlgorithm(selectedAlgorithm, 'walkthrough')}>Step-by-step</button>
                <button role="tab" aria-selected={algorithmView === 'python'} class:active={algorithmView === 'python'} onclick={() => selectAlgorithm(selectedAlgorithm, 'python')}>Python implementation</button>
              </div>
              {#if algorithmView === 'walkthrough'}
                <iframe class="walkthrough-frame" title="{selectedAlgorithm.name} step-by-step walkthrough" src="./walkthroughs/{selectedAlgorithm.walkthrough}"></iframe>
              {:else if pythonLoading}
                <p class="code-status">Loading the implementation…</p>
              {:else if pythonError}
                <p class="code-status error">{pythonError}</p>
              {:else}
                <pre class="python-code"><code>{pythonSource}</code></pre>
              {/if}
            </section>
          {/if}
          <p class="section-footnote">These are quick per-algorithm reminders. The <button class="inline-link" onclick={() => openPage('complexity', 'time')}>Complexity domain</button> teaches how to analyze bounds and cases in general.</p>
        </section>
        <footer>Counting Sort depends on input length n and range width k. Shell Sort depends on its gap sequence.</footer>

      {:else if domain === 'discrete' && topic === 'induction'}
        <section class="page-hero compact-hero"><p class="eyebrow">{pageKicker}</p><h1>Proof by induction</h1><p class="intro">Prove a whole family of statements by checking the first case, then showing each true case carries the next one with it.</p></section>
        <div class="lesson-layout"><article class="lesson-main">
          <article class="worked-example"><div class="example-head"><span>Worked example A</span><span class="example-tag">Sum of first n integers</span></div><div class="math-display"><math display="block"><mrow><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>i</mi><mo>=</mo><mfrac><mrow><mi>n</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow><mn>2</mn></mfrac></mrow></math></div><ol class="proof-steps"><li><b>Base case, n = 1.</b><p>Left side = 1. Right side = 1(2)/2 = 1. The claim holds.</p></li><li><b>Inductive hypothesis.</b><p>Assume 1 + 2 + ··· + k = k(k + 1)/2.</p></li><li><b>Prove the next case.</b><p>Add k + 1 to both sides of the assumed sum:</p><div class="math-display"><math display="block"><mtable columnalign="left"><mtr><mtd><mrow><mn>1</mn><mo>+</mo><mo>⋯</mo><mo>+</mo><mi>k</mi><mo>+</mo><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mtd><mtd><mo>=</mo></mtd><mtd><mrow><mfrac><mrow><mi>k</mi><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow><mn>2</mn></mfrac><mo>+</mo><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mtd></mtr><mtr><mtd></mtd><mtd><mo>=</mo></mtd><mtd><mfrac><mrow><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo><mo>(</mo><mi>k</mi><mo>+</mo><mn>2</mn><mo>)</mo></mrow><mn>2</mn></mfrac></mtd></mtr></mtable></math></div></li><li><b>Conclusion.</b><p>That is the formula with n = k + 1, so the statement holds for every positive integer n.</p></li></ol></article>
          <article class="worked-example"><div class="example-head"><span>Worked example B</span><span class="example-tag">Powers of two</span></div><div class="math-display"><math display="block"><mrow><msup><mn>2</mn><mi>n</mi></msup><mo>≥</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>,</mo><mspace width="0.6em"/><mi>n</mi><mo>≥</mo><mn>0</mn></mrow></math></div><ol class="proof-steps"><li><b>Base case, n = 0.</b><p>2⁰ = 1 ≥ 1.</p></li><li><b>Assume the claim at k.</b><p>Suppose 2ᵏ ≥ k + 1.</p></li><li><b>Use the assumption.</b><p>Multiply by 2: 2ᵏ⁺¹ ≥ 2(k + 1) ≥ k + 2, since k ≥ 0.</p></li><li><b>Conclusion.</b><p>Therefore 2ⁿ ≥ n + 1 for all n ≥ 0.</p></li></ol></article>
        </article><aside class="lesson-aside"><p class="eyebrow">Proof checklist</p><h3>Keep the logic honest</h3><ul><li>State exactly where n starts.</li><li>Assume only P(k)—not the result you need to prove.</li><li>Show the algebraic bridge to P(k + 1).</li><li>Finish with a sentence that closes the induction.</li></ul><button class="aside-link" onclick={() => openPage('discrete', 'telescoping')}>Next: telescoping sums →</button></aside></div>

      {:else if domain === 'discrete' && topic === 'telescoping'}
        <section class="page-hero compact-hero"><p class="eyebrow">{pageKicker}</p><h1>Telescoping sums</h1><p class="intro">Rewrite each term as a difference. The middle terms cancel in pairs, leaving only the endpoints.</p></section>
        <div class="lesson-layout"><article class="lesson-main"><article class="worked-example"><div class="example-head"><span>Worked example</span><span class="example-tag">A cancellation pattern</span></div><h2>Evaluate</h2><div class="math-display"><math display="block"><mrow><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mfrac><mn>1</mn><mrow><mi>k</mi><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mfrac></mrow></math></div><div class="derivation"><p><span class="step-label">1 · Split the fraction</span></p><div class="math-display"><math display="block"><mrow><mfrac><mn>1</mn><mrow><mi>k</mi><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mfrac><mo>=</mo><mfrac><mn>1</mn><mi>k</mi></mfrac><mo>−</mo><mfrac><mn>1</mn><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></mfrac></mrow></math></div><p><span class="step-label">2 · Expand a few terms</span></p><div class="math-display math-wide"><math display="block"><mrow><mo>(</mo><mn>1</mn><mo>−</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>)</mo><mo>+</mo><mo>(</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>−</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>)</mo><mo>+</mo><mo>(</mo><mfrac><mn>1</mn><mn>3</mn></mfrac><mo>−</mo><mfrac><mn>1</mn><mn>4</mn></mfrac><mo>)</mo><mo>+</mo><mo>⋯</mo><mo>+</mo><mo>(</mo><mfrac><mn>1</mn><mi>n</mi></mfrac><mo>−</mo><mfrac><mn>1</mn><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></mfrac><mo>)</mo></mrow></math></div><p><span class="step-label">3 · Cancel matching neighbors</span></p><div class="math-display math-wide"><math display="block"><mrow><mstyle mathcolor="#9ce8c9"><mn>1</mn></mstyle><mo>−</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mn>2</mn></mfrac></mstyle><mo>+</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mn>2</mn></mfrac></mstyle><mo>−</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mn>3</mn></mfrac></mstyle><mo>+</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mn>3</mn></mfrac></mstyle><mo>+</mo><mo>⋯</mo><mo>−</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mi>n</mi></mfrac></mstyle><mo>+</mo><mstyle mathcolor="#777b88"><mfrac><mn>1</mn><mi>n</mi></mfrac></mstyle><mo>−</mo><mstyle mathcolor="#9ce8c9"><mfrac><mn>1</mn><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></mfrac></mstyle></mrow></math></div><p><span class="step-label">4 · Keep the endpoints</span></p><div class="math-display result-display"><math display="block"><mrow><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mfrac><mn>1</mn><mrow><mi>k</mi><mo>(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mfrac><mo>=</mo><mn>1</mn><mo>−</mo><mfrac><mn>1</mn><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></mfrac><mo>=</mo><mfrac><mi>n</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></mfrac></mrow></math></div></div></article><section class="concept-card"><span class="concept-number">↻</span><div><h2>How to spot one</h2><p>Look for adjacent terms that can be written as F(k) − F(k + 1). When expanded, each negative copy is canceled by the next positive copy.</p></div></section></article><aside class="lesson-aside"><p class="eyebrow">The pattern</p><h3>Neighbor cancels neighbor</h3><div class="math-display mini-math"><math display="block"><mtable columnalign="right"><mtr><mtd><mi>F</mi><mo>(</mo><mn>1</mn><mo>)</mo><mo>−</mo><mi>F</mi><mo>(</mo><mn>2</mn><mo>)</mo></mtd></mtr><mtr><mtd><mo>+</mo><mi>F</mi><mo>(</mo><mn>2</mn><mo>)</mo><mo>−</mo><mi>F</mi><mo>(</mo><mn>3</mn><mo>)</mo></mtd></mtr><mtr><mtd><mo>+</mo><mi>F</mi><mo>(</mo><mn>3</mn><mo>)</mo><mo>−</mo><mi>F</mi><mo>(</mo><mn>4</mn><mo>)</mo></mtd></mtr><mtr><mtd><mo>+</mo><mo>⋯</mo></mtd></mtr><mtr><mtd><mo>+</mo><mi>F</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>−</mo><mi>F</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></mtd></mtr></mtable><mo>=</mo><mi>F</mi><mo>(</mo><mn>1</mn><mo>)</mo><mo>−</mo><mi>F</mi><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></math></div><button class="aside-link" onclick={() => openPage('discrete', 'master')}>Next: Master theorem →</button></aside></div>

      {:else if domain === 'discrete' && topic === 'master'}
        <section class="page-hero compact-hero"><p class="eyebrow">{pageKicker}</p><h1>Master theorem</h1><p class="intro">A shortcut for the time complexity of many divide-and-conquer recurrences.</p></section>
        <article class="worked-example theorem-card"><div class="example-head"><span>Start with the recurrence</span><span class="example-tag">Recurrence form</span></div><div class="math-display"><math display="block"><mrow><mi>T</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>=</mo><mi>a</mi><mi>T</mi><mo>(</mo><mfrac><mi>n</mi><mi>b</mi></mfrac><mo>)</mo><mo>+</mo><mi>f</mi><mo>(</mo><mi>n</mi><mo>)</mo></mrow></math></div><div class="theorem-terms"><div><b>a</b><span>number of subproblems</span></div><div><b>b</b><span>factor each subproblem shrinks by</span></div><div><b>f(n)</b><span>work outside the recursive calls</span></div></div><p class="theorem-anchor">Compare f(n) with this benchmark:</p><div class="math-display"><math display="block"><mrow><msup><mi>n</mi><mfrac><mrow><mi>log</mi><mi>a</mi></mrow><mrow><mi>log</mi><mi>b</mi></mrow></mfrac></msup></mrow></math></div><div class="case-grid"><section><span class="case-label">Case 1 · recursion dominates</span><p>f(n) is polynomially smaller than the benchmark.</p><div class="math-display compact-math"><math display="block"><mrow><mi>T</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>=</mo><mi>Θ</mi><mo>(</mo><msup><mi>n</mi><mfrac><mrow><mi>log</mi><mi>a</mi></mrow><mrow><mi>log</mi><mi>b</mi></mrow></mfrac></msup><mo>)</mo></mrow></math></div></section><section><span class="case-label">Case 2 · levels balance</span><p>f(n) matches the benchmark, up to logarithmic factors.</p><div class="math-display compact-math"><math display="block"><mrow><mi>T</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>=</mo><mi>Θ</mi><mo>(</mo><msup><mi>n</mi><mfrac><mrow><mi>log</mi><mi>a</mi></mrow><mrow><mi>log</mi><mi>b</mi></mrow></mfrac></msup><mi>log</mi><mi>n</mi><mo>)</mo></mrow></math></div></section><section><span class="case-label">Case 3 · outside work dominates</span><p>f(n) is polynomially larger, with the regularity condition satisfied.</p><div class="math-display compact-math"><math display="block"><mrow><mi>T</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>=</mo><mi>Θ</mi><mo>(</mo><mi>f</mi><mo>(</mo><mi>n</mi><mo>)</mo><mo>)</mo></mrow></math></div></section></div></article>
        <div class="example-grid"><article class="worked-example"><div class="example-head"><span>Example 1</span><span class="example-tag">Merge Sort</span></div><h2>T(n) = 2T(n/2) + n</h2><p>a = 2, b = 2, so n<sup>log₂2</sup> = n. The outside work f(n) = n matches: Case 2.</p><div class="formula result">T(n) = Θ(n log n)</div></article><article class="worked-example"><div class="example-head"><span>Example 2</span><span class="example-tag">Two recursive halves</span></div><h2>T(n) = 2T(n/2) + 1</h2><p>The recursion contributes n leaves; constant work at each internal node is smaller. Case 1.</p><div class="formula result">T(n) = Θ(n)</div></article><article class="worked-example"><div class="example-head"><span>Example 3</span><span class="example-tag">Outside work dominates</span></div><h2>T(n) = 2T(n/2) + n²</h2><p>n² is polynomially larger than n, and the regularity condition holds. Case 3.</p><div class="formula result">T(n) = Θ(n²)</div></article></div>
        <p class="caution"><strong>Check the assumptions:</strong> the basic Master theorem does not cover every recurrence. Uneven splits, multiple non-recursive terms, and irregular subproblem sizes may need a recursion tree or another theorem.</p>

      {:else if domain === 'complexity' && topic === 'time'}
        <section class="page-hero compact-hero"><p class="eyebrow">{pageKicker}</p><h1>Time complexity</h1><p class="intro">Describe how the amount of work grows with input size—not how many seconds one particular computer takes.</p></section>
        <div class="lesson-layout"><article class="lesson-main"><section class="concept-card"><span class="concept-number">f(n)</span><div><h2>Count growth, not clock time</h2><p>Choose a basic operation, count how often it happens as the input grows, then keep the dominant growth. Constants and lower-order terms matter less at large n.</p><div class="formula">3n² + 8n + 12  →  Θ(n²)</div></div></section><div class="case-grid"><section><span class="case-label">Best case</span><p>Most favorable input of size n.</p></section><section><span class="case-label">Average case</span><p>Expected work under a stated input distribution.</p></section><section><span class="case-label">Worst case</span><p>Maximum work over inputs of size n.</p></section></div><article class="worked-example"><div class="example-head"><span>Notation is a different question</span><span class="example-tag">Growth bounds</span></div><div class="notation-list"><p><b>O(g(n))</b><span>Asymptotic upper bound: growth no faster than g, up to a constant.</span></p><p><b>Ω(g(n))</b><span>Asymptotic lower bound: growth at least as fast as g, up to a constant.</span></p><p><b>Θ(g(n))</b><span>Tight bound: both O(g(n)) and Ω(g(n)).</span></p></div><p class="caution">Best / average / worst describes which inputs you analyze. O / Ω / Θ describes the mathematical bound you prove. They are related, but they are not interchangeable.</p></article></article><aside class="lesson-aside"><p class="eyebrow">Useful growth order</p><h3>Slow to fast</h3><div class="growth-list"><span>1</span><span>log n</span><span>n</span><span>n log n</span><span>n²</span><span>2ⁿ</span><span>n!</span></div><button class="aside-link" onclick={() => openPage('complexity', 'space')}>Next: space complexity →</button></aside></div>

      {:else if domain === 'complexity' && topic === 'space'}
        <section class="page-hero compact-hero"><p class="eyebrow">{pageKicker}</p><h1>Space complexity</h1><p class="intro">Track how memory use grows with input size. Be explicit about whether you count the input itself.</p></section>
        <div class="lesson-layout"><article class="lesson-main"><section class="concept-card"><span class="concept-number">RAM</span><div><h2>Input space vs. auxiliary space</h2><p><strong>Total space</strong> includes the input and everything the algorithm allocates. <strong>Auxiliary space</strong> counts only the extra working memory beyond the input.</p></div></section><div class="example-grid"><article class="worked-example"><div class="example-head"><span>In place</span><span class="example-tag">Insertion Sort</span></div><h2>Θ(1) auxiliary space</h2><p>It keeps a few indices and one key value, shifting items inside the original array.</p></article><article class="worked-example"><div class="example-head"><span>Needs a buffer</span><span class="example-tag">Merge Sort</span></div><h2>Θ(n) auxiliary space</h2><p>Merging typically uses a temporary array proportional to the number of values being merged.</p></article></div><article class="worked-example"><div class="example-head"><span>Ask these questions</span><span class="example-tag">A quick checklist</span></div><ol class="proof-steps"><li><b>What grows with n?</b><p>Count arrays, stacks, maps, recursion frames, and other stored values.</p></li><li><b>Is the input counted?</b><p>State total space or auxiliary space; do not switch definitions halfway through.</p></li><li><b>What is the peak?</b><p>Memory is about the maximum live storage at one time, not every allocation added together.</p></li></ol></article></article><aside class="lesson-aside"><p class="eyebrow">Compare</p><h3>Same time, different memory</h3><p>Two algorithms can both run in Θ(n log n) time yet use different auxiliary space. Runtime and memory are separate resources; analyze each one explicitly.</p><button class="aside-link" onclick={() => openPage('complexity', 'time')}>← Time complexity</button></aside></div>
      {/if}
    </main>
    <footer class="site-footer"><span>DSA Study Studio</span><span>Clear steps · careful reasoning · keep learning</span></footer>
  </div>
</div>

