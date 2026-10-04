import Chart from 'chart.js/auto';
import { onDestroy } from 'svelte';
import { countShellGaps, getGrowthModel } from './model.ts';

export function createViewModel(props = () => ({})) {
  let { algorithmId, algorithmName, gapSequence = 'halving' } = $derived(props());
  let chartCanvas = $state(null);
  let inputSize = $state(128);
  let rangeWidth = $state(32);
  let visibleCases = $state({ best: true, average: true, worst: true });
  let model = $derived(getGrowthModel(algorithmId, gapSequence));

  const caseNames = { best: 'Best case', average: 'Average case', worst: 'Worst case' };
  const colors = { best: '#5de0ac', average: '#f3bf5f', worst: '#ff896d' };

  // Imperative adapter handle, not UI state. Tracking it would make chart
  // replacement retrigger its own effect indefinitely.
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
    const inputs = [
      ...new Set(
        Array.from({ length: sampleCount }, (_, index) => Math.max(1, Math.round(((index + 1) * limit) / sampleCount))),
      ),
    ];
    const datasets = Object.entries(activeModel.cases)
      .filter(([key, definition]) => shown[key] && definition.value)
      .map(([key, definition]) => ({
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
              label: (item) =>
                `${item.dataset.label}: ${new Intl.NumberFormat().format(Math.round(item.parsed.y))} ${item.dataset.countKind.startsWith('Exact') ? 'comparisons (exact)' : 'model units'}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: limit,
            title: { display: true, text: 'Input size (n)', color: '#b4bac6', font: { size: 11 } },
            grid: { color: '#ffffff0c' },
            ticks: { color: '#9298a6', maxTicksLimit: 8, font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Dominant operations (model)', color: '#b4bac6', font: { size: 11 } },
            grid: { color: '#ffffff12' },
            ticks: {
              color: '#9298a6',
              maxTicksLimit: 6,
              font: { size: 10 },
              callback: (value) =>
                new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value),
            },
          },
        },
      },
    });
  });

  onDestroy(() => chart?.destroy());
  return {
    get countShellGaps() {
      return countShellGaps;
    },
    get chartCanvas() {
      return chartCanvas;
    },
    set chartCanvas(value) {
      chartCanvas = value;
    },
    get inputSize() {
      return inputSize;
    },
    set inputSize(value) {
      inputSize = value;
    },
    get rangeWidth() {
      return rangeWidth;
    },
    set rangeWidth(value) {
      rangeWidth = value;
    },
    get visibleCases() {
      return visibleCases;
    },
    set visibleCases(value) {
      visibleCases = value;
    },
    get model() {
      return model;
    },
    get caseNames() {
      return caseNames;
    },
    get colors() {
      return colors;
    },
    get toggleCase() {
      return toggleCase;
    },
  };
}
