<script>
  import { visibleAlgorithms } from './algorithms.js';

  let query = $state('');
  let items = $derived(visibleAlgorithms(query));
</script>

<svelte:head>
  <title>Sorting Algorithm Walkthroughs</title>
  <meta name="description" content="Interactive sorting walkthroughs, Python implementations, and complexity notes." />
</svelte:head>

<main>
  <header class="hero">
    <p class="eyebrow">A visual study guide</p>
    <h1>Sorting, one move at a time.</h1>
    <p class="intro">Walk through each algorithm at your own pace. See the array change, read why each move happens, then open the Python version alongside it.</p>
    <div class="memory-cue">
      <span class="cue-label">Quick recall</span>
      <span>Quick / Merge / Tim split or merge ranges</span>
      <span>Insertion grows a sorted prefix</span>
      <span>Selection chooses the next minimum</span>
      <span>Shell narrows its gaps</span>
      <span>Counting turns frequencies into positions</span>
    </div>
  </header>

  <section class="catalog" aria-labelledby="catalog-title">
    <div class="catalog-heading">
      <div>
        <p class="eyebrow">The collection</p>
        <h2 id="catalog-title">Choose an algorithm</h2>
      </div>
      <label class="search">
        <span>Filter</span>
        <input bind:value={query} placeholder="Try “divide and conquer”" />
      </label>
    </div>

    <div class="cards">
      {#each items as algorithm (algorithm.id)}
        <article class="card">
          <div class="card-top">
            <h3>{algorithm.name}</h3>
            <span class:yes={algorithm.divide.startsWith('Yes')} class="dnc">D&C: {algorithm.divide}</span>
          </div>
          <p class="cue">{algorithm.cue}</p>
          <dl class="bounds">
            <div><dt>Runtime lower bound</dt><dd>{algorithm.lower}</dd></div>
            <div><dt>Runtime upper bound</dt><dd>{algorithm.upper}</dd></div>
          </dl>
          <p class="extra">{algorithm.extra}</p>
          <div class="actions">
            <a class="primary" href="./walkthroughs/{algorithm.walkthrough}">Open walkthrough</a>
            <a class="secondary" href="./walkthroughs/{algorithm.python}" target="_blank" rel="noopener">Python implementation ↗</a>
          </div>
        </article>
      {:else}
        <p class="empty">No matches. Try a sort name or a memory cue.</p>
      {/each}
    </div>
  </section>

  <footer>
    Lower bound describes best-case runtime for the listed implementation; upper bound describes its worst case. Counting Sort depends on input length n and range width k. Shell Sort depends on its gap sequence.
  </footer>
</main>

