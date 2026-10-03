<script>
  let { comparisons } = $props();
  let activeId = $state('strict-upper');
  let active = $derived(comparisons.find(item => item.id === activeId) ?? comparisons[0]);
  const width = 720;
  const height = 300;
  const padding = { top: 22, right: 22, bottom: 42, left: 54 };
  const samples = Array.from({ length: 40 }, (_, index) => 1 + index * (99 / 39));
  let ratios = $derived(samples.map(n => active.f(n) / active.g(n)));
  let maxRatio = $derived(Math.max(...ratios, 0.00001));
  let path = $derived(ratios.map((ratio, index) => {
    const x = padding.left + (index / (ratios.length - 1)) * (width - padding.left - padding.right);
    const y = padding.top + (1 - ratio / maxRatio) * (height - padding.top - padding.bottom);
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' '));
  const chartBottom = height - padding.bottom;
  const chartRight = width - padding.right;
</script>

<section class="ratio-lab" aria-labelledby="ratio-title">
  <div class="ratio-heading">
    <div><p class="ratio-overline">Visualize · compare the functions</p><h2 id="ratio-title">Watch f(n) / g(n)</h2></div>
    <p>For nonnegative functions, the ratio makes the relationship visible as n grows.</p>
  </div>
  <div class="ratio-choices" role="group" aria-label="Choose a function comparison">
    {#each comparisons as item}
      <button class:active={active.id === item.id} aria-pressed={active.id === item.id} onclick={() => (activeId = item.id)}>{item.title}</button>
    {/each}
  </div>
  <div class="ratio-formula"><span><i>f</i>(n) = {active.fLabel}</span><span><i>g</i>(n) = {active.gLabel}</span></div>
  <div class="ratio-chart-wrap">
    <svg class="ratio-chart" viewBox="0 0 {width} {height}" role="img" aria-labelledby="ratio-chart-title ratio-chart-desc">
      <title id="ratio-chart-title">Ratio of {active.fLabel} divided by {active.gLabel}</title>
      <desc id="ratio-chart-desc">As input n grows from 1 to 100, the ratio {active.id === 'strict-upper' ? 'approaches zero' : active.id === 'tight' ? 'approaches a positive constant' : 'increases without bound'}.</desc>
      <line class="axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={chartBottom} />
      <line class="axis" x1={padding.left} y1={chartBottom} x2={chartRight} y2={chartBottom} />
      <line class="gridline" x1={padding.left} y1={(padding.top + chartBottom) / 2} x2={chartRight} y2={(padding.top + chartBottom) / 2} />
      <path class="ratio-line" d={path} />
      <text class="axis-label" x="17" y="24">f(n) / g(n)</text>
      <text class="tick-label" x={padding.left - 8} y={padding.top + 4} text-anchor="end">{maxRatio.toPrecision(2)}</text>
      <text class="tick-label" x={padding.left - 8} y={chartBottom + 4} text-anchor="end">0</text>
      <text class="tick-label" x={padding.left} y={height - 12}>1</text>
      <text class="tick-label" x={chartRight} y={height - 12} text-anchor="end">100</text>
      <text class="axis-label" x={(padding.left + chartRight) / 2} y={height - 2} text-anchor="middle">input size n</text>
    </svg>
  </div>
  <p class="ratio-conclusion"><span>What to notice</span>{active.conclusion}</p>
  <p class="ratio-footnote">The vertical scale fits the selected comparison, so compare the curve’s trend—not its height across different choices.</p>
</section>

<style>
  .ratio-lab { display:grid; gap:16px; margin:22px 0; }
  .ratio-heading { display:flex; justify-content:space-between; align-items:end; gap:22px; }
  .ratio-heading > p { max-width:340px; margin:0; color:#9eacbd; font-size:12px; line-height:1.65; }
  .ratio-overline { margin:0 0 5px; color:#65d9b0; font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
  h2 { margin:0; color:#e5edf6; font-size:clamp(18px,2vw,23px); }
  .ratio-choices { display:flex; flex-wrap:wrap; gap:7px; }
  button { min-height:38px; padding:8px 12px; border:1px solid #3a4655; border-radius:0; background:#20232a; color:#b8c5d4; font:inherit; font-size:12px; cursor:pointer; }
  button:hover,button.active { border-color:#65d9b0; color:#dcfff2; background:#1c302b; }
  button:focus-visible { outline:2px solid #79b7ff; outline-offset:2px; }
  .ratio-formula { display:flex; flex-wrap:wrap; gap:8px 22px; padding:11px 14px; border:1px solid #343d49; background:#181b21; color:#d4dfec; font-size:13px; }
  .ratio-formula i { color:#65d9b0; }
  .ratio-chart-wrap { min-width:0; padding:12px 12px 7px; border:1px solid #343d49; background:#17191f; }
  .ratio-chart { display:block; width:100%; height:auto; overflow:visible; }
  .axis { stroke:#657184; stroke-width:1.3; }
  .gridline { stroke:#39414d; stroke-width:1; stroke-dasharray:4 6; }
  .ratio-line { fill:none; stroke:#65d9b0; stroke-width:3.5; stroke-linecap:round; stroke-linejoin:round; vector-effect:non-scaling-stroke; }
  .axis-label { fill:#aebdce; font-size:12px; }
  .tick-label { fill:#8492a4; font-size:11px; }
  .ratio-conclusion { display:grid; grid-template-columns:120px minmax(0,1fr); gap:15px; margin:0; padding:14px 16px; border-left:2px solid #65d9b0; background:#1d2926; color:#d4e5dd; font-size:13px; line-height:1.65; }
  .ratio-conclusion span { color:#65d9b0; font-size:11px; }
  .ratio-footnote { margin:0; color:#8290a2; font-size:11px; line-height:1.6; }
  @media(max-width:620px) { .ratio-heading { display:grid; gap:8px; } .ratio-conclusion { grid-template-columns:1fr; gap:4px; } .ratio-chart-wrap { padding-inline:4px; } }
</style>
