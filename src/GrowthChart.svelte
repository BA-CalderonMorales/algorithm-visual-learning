<script>
  import Chart from 'chart.js/auto';
  import { onDestroy } from 'svelte';
  import { countShellGaps, getGrowthModel } from './growth-models.js';

  let { algorithmId, algorithmName, gapSequence = $bindable('halving') } = $props();
  let chartCanvas = $state(null);
  let inputSize = $state(128);
  let rangeWidth = $state(32);
  let visibleCases = $state({ best: true, average: true, worst: true });
  let model = $derived(getGrowthModel(algorithmId, gapSequence));

  const caseNames = { best: 'Best case', average: 'Average case', worst: 'Worst case' };
  const colors = { best: '#5de0ac', average: '#f3bf5f', worst: '#ff896d' };
  let chart;

  function toggleCase(which) {
    visibleCases = { ...visibleCases, [which]: !visibleCases[which] };
  }

  $effect(() => {
    const canvas = chartCanvas;
    const activeModel = model;
    const limit = inputSize;
    const k = rangeWidth;
    const shown = visibleCases;
    if (!canvas || !activeModel) return;

    chart?.destroy();
    const sampleCount = 48;
    const inputs = [...new Set(Array.from({ length: sampleCount }, (_, index) => Math.max(1, Math.round((index + 1) * limit / sampleCount))))];
    const datasets = Object.entries(activeModel.cases).filter(([key, definition]) => shown[key] && definition.value).map(([key, definition]) => ({
      label: `${caseNames[key]} · ${definition.bound}`,
      countKind: definition.kind,
      data: inputs.map((n) => ({ x: n, y: Math.max(0, definition.value(n, k)) })),
      borderColor: colors[key],
      backgroundColor: colors[key],
      borderWidth: 2.5,
      borderDash: key === 'average' ? [7, 4] : key === 'worst' ? [2, 3] : [],
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.18,
    }));

    chart = new Chart(canvas, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 180 },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111318',
            borderColor: '#454956',
            borderWidth: 1,
            titleColor: '#eef0f5',
            bodyColor: '#c3c8d2',
            callbacks: {
              title: (items) => `Input size n = ${items[0]?.parsed.x ?? ''}`,
              label: (item) => `${item.dataset.label}: ${new Intl.NumberFormat().format(Math.round(item.parsed.y))} ${item.dataset.countKind.startsWith('Exact') ? 'comparisons (exact)' : 'model units'}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear', min: 1, max: limit,
            title: { display: true, text: 'Input size (n)', color: '#b4bac6', font: { size: 11 } },
            grid: { color: '#ffffff0c' },
            ticks: { color: '#9298a6', maxTicksLimit: 8, font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Dominant operations (model)', color: '#b4bac6', font: { size: 11 } },
            grid: { color: '#ffffff12' },
            ticks: { color: '#9298a6', maxTicksLimit: 6, font: { size: 10 }, callback: (value) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value) },
          },
        },
      },
    });
  });

  onDestroy(() => chart?.destroy());
</script>

<section class="learning-view growth-view" aria-labelledby="growth-title">
  <header class="growth-heading">
    <div>
      <p class="eyebrow">Theoretical operation growth</p>
      <h2 id="growth-title">How the work scales</h2>
    </div>
    <p>The same case bounds as Complexity, drawn as input size grows. Exact counts are labeled; other curves show the dominant term with coefficient 1.</p>
  </header>

  <div class="growth-controls" aria-label="Growth chart controls">
    <label class="growth-input">Input size <strong>n = {inputSize}</strong><input type="range" min="16" max="512" step="16" bind:value={inputSize} aria-label="Maximum input size" /></label>
    {#if algorithmId === 'counting'}
      <label class="growth-input">Value range <strong>k = {rangeWidth}</strong><input type="range" min="1" max="256" step="1" bind:value={rangeWidth} aria-label="Counting Sort value range width k" /></label>
    {/if}
    {#if algorithmId === 'shell'}
      <label class="growth-select">Gap sequence
        <select bind:value={gapSequence} aria-label="Shell Sort gap sequence">
          <option value="halving">Halving: n/2, n/4, …, 1</option>
          <option value="knuth">Knuth: 1, 4, 13, …</option>
        </select>
      </label>
    {/if}
  </div>

  <div class="growth-chart-layout">
    <div class="growth-chart-wrap" role="img" aria-label="Theoretical dominant-operation growth chart for {algorithmName}">
      <canvas bind:this={chartCanvas} aria-hidden="true"></canvas>
    </div>
    <aside class="growth-key" aria-label="Toggle chart cases">
      <p class="growth-key-title">Show cases</p>
      {#each Object.keys(caseNames) as key}
        <label class="growth-case-toggle">
          <input type="checkbox" checked={!!model.cases[key].value && visibleCases[key]} disabled={!model.cases[key].value} onchange={() => toggleCase(key)} />
          <span class="growth-swatch" class:average-swatch={key === 'average'} class:worst-swatch={key === 'worst'} style="--case-color: {colors[key]}"></span>
          <span>{caseNames[key]}{!model.cases[key].value ? ' · not plotted' : ''}</span>
        </label>
      {/each}
      <p class="growth-operation"><span>Dominant operation</span><strong>{model.operation}</strong></p>
    </aside>
  </div>

  <div class="growth-formulas" aria-label="Case model formulas">
    {#each Object.entries(model.cases) as [key, definition]}
      <article class="growth-formula" class:case-muted={!visibleCases[key]}>
        <span class="growth-swatch" class:average-swatch={key === 'average'} class:worst-swatch={key === 'worst'} style="--case-color: {colors[key]}"></span>
        <div><strong>{caseNames[key]} · {definition.bound}</strong><span class="growth-assumption">{definition.assumption}</span><span class="growth-model-label">{definition.kind}</span><code>{definition.formula}</code></div>
      </article>
    {/each}
  </div>

  {#if algorithmId === 'counting'}
    <p class="growth-note">{model.note} Here k is the selected range width ({rangeWidth}).</p>
  {:else if algorithmId === 'shell'}
    <p class="growth-note">{model.note} The selected sequence has {countShellGaps(inputSize, gapSequence)} gaps at n = {inputSize}.</p>
  {:else}
    <p class="growth-note">{model.note}</p>
  {/if}
  <a class="secondary learning-link" href="#/algorithms/{algorithmId}/complexity">Read the reasoning in Complexity →</a>
</section>
