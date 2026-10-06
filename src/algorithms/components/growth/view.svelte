<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import NavigationLink from '../../../shared/ui/navigation-link/view.svelte';

  let { algorithmId, algorithmName, gapSequence = $bindable('halving') } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ algorithmId, algorithmName, gapSequence }));
</script>

<section class={classNames(styles, 'learning-view growth-view')} aria-labelledby="growth-title">
  <header class={classNames(styles, 'growth-heading')}>
    <div class={styles.scope}>
      <p class={classNames(styles, 'eyebrow')}>Theoretical operation growth</p>
      <h2 class={styles.scope} id="growth-title">How the work scales</h2>
    </div>
    <p class={styles.scope}>
      The same case bounds as Complexity, drawn as input size grows. Exact counts are labeled; other curves show the
      dominant term with coefficient 1.
    </p>
  </header>

  <div class={classNames(styles, 'growth-controls')} aria-label="Growth chart controls">
    <label class={classNames(styles, 'growth-input')}
      >Input size <strong class={styles.scope}>n = {vm.inputSize}</strong><input
        class={styles.scope}
        type="range"
        min="16"
        max="512"
        step="16"
        bind:value={vm.inputSize}
        aria-label="Maximum input size"
      /></label
    >
    {#if algorithmId === 'counting'}
      <label class={classNames(styles, 'growth-input')}
        >Value range <strong class={styles.scope}>k = {vm.rangeWidth}</strong><input
          class={styles.scope}
          type="range"
          min="1"
          max="256"
          step="1"
          bind:value={vm.rangeWidth}
          aria-label="Counting Sort value range width k"
        /></label
      >
    {/if}
    {#if algorithmId === 'shell'}
      <label class={classNames(styles, 'growth-select')}
        >Gap sequence
        <select class={styles.scope} bind:value={gapSequence} aria-label="Shell Sort gap sequence">
          <option class={styles.scope} value="halving">Halving: n/2, n/4, …, 1</option>
          <option class={styles.scope} value="knuth">Knuth: 1, 4, 13, …</option>
        </select>
      </label>
    {/if}
  </div>

  <div class={classNames(styles, 'growth-chart-layout')}>
    <div
      class={classNames(styles, 'growth-chart-wrap')}
      role="img"
      aria-label="Theoretical dominant-operation growth chart for {algorithmName}"
    >
      <canvas class={styles.scope} bind:this={vm.chartCanvas} aria-hidden="true"></canvas>
    </div>
    <aside class={classNames(styles, 'growth-key')} aria-label="Toggle chart cases">
      <p class={classNames(styles, 'growth-key-title')}>Show cases</p>
      {#each Object.keys(vm.caseNames) as key}
        <label class={classNames(styles, 'growth-case-toggle')}>
          <input
            class={styles.scope}
            type="checkbox"
            checked={!!vm.model.cases[key].value && vm.visibleCases[key]}
            disabled={!vm.model.cases[key].value}
            onchange={() => vm.toggleCase(key)}
          />
          <span
            class={classNames(styles, 'growth-swatch', {
              'average-swatch': key === 'average',
              'worst-swatch': key === 'worst',
            })}
            style="--case-color: {vm.colors[key]}"
          ></span>
          <span class={styles.scope}>{vm.caseNames[key]}{!vm.model.cases[key].value ? ' · not plotted' : ''}</span>
        </label>
      {/each}
      <p class={classNames(styles, 'growth-operation')}>
        <span class={styles.scope}>Dominant operation</span><strong class={styles.scope}>{vm.model.operation}</strong>
      </p>
    </aside>
  </div>

  <div class={classNames(styles, 'growth-formulas')} aria-label="Case model formulas">
    {#each Object.entries(vm.model.cases) as [key, definition]}
      <article class={classNames(styles, 'growth-formula', { 'case-muted': !vm.visibleCases[key] })}>
        <span
          class={classNames(styles, 'growth-swatch', {
            'average-swatch': key === 'average',
            'worst-swatch': key === 'worst',
          })}
          style="--case-color: {vm.colors[key]}"
        ></span>
        <div class={styles.scope}>
          <strong class={styles.scope}>{vm.caseNames[key]} · {definition.bound}</strong><span
            class={classNames(styles, 'growth-assumption')}>{definition.assumption}</span
          ><span class={classNames(styles, 'growth-model-label')}>{definition.kind}</span><code class={styles.scope}
            >{definition.formula}</code
          >
        </div>
      </article>
    {/each}
  </div>

  {#if algorithmId === 'counting'}
    <p class={classNames(styles, 'growth-note')}>
      {vm.model.note} Here k is the selected range width ({vm.rangeWidth}).
    </p>
  {:else if algorithmId === 'shell'}
    <p class={classNames(styles, 'growth-note')}>
      {vm.model.note} The selected sequence has {vm.countShellGaps(vm.inputSize, gapSequence)} gaps at n = {vm.inputSize}.
    </p>
  {:else}
    <p class={classNames(styles, 'growth-note')}>{vm.model.note}</p>
  {/if}
  <div class={classNames(styles, 'growth-action')}>
    <NavigationLink href="#/algorithms/{algorithmId}/complexity" label="Read the reasoning in Complexity" />
  </div>
</section>
