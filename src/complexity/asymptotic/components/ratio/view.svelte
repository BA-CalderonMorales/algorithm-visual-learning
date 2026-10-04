<script>
  import styles from './view.module.css';
  import { classNames } from '../../../../shared/ui/class-names.ts';

  let { comparisons } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ comparisons }));
</script>

<section class={classNames(styles, 'ratio-lab')} aria-labelledby="ratio-title">
  <div class={classNames(styles, 'ratio-heading')}>
    <div class={styles.scope}>
      <p class={classNames(styles, 'ratio-overline')}>Visualize · compare the functions</p>
      <h2 class={styles.scope} id="ratio-title">Watch f(n) / g(n)</h2>
    </div>
    <p class={styles.scope}>For nonnegative functions, the ratio makes the relationship visible as n grows.</p>
  </div>
  <div class={classNames(styles, 'ratio-choices')} role="group" aria-label="Choose a function comparison">
    {#each comparisons as item}
      <button
        class={classNames(styles, '', { active: vm.active.id === item.id })}
        aria-pressed={vm.active.id === item.id}
        onclick={() => (vm.activeId = item.id)}>{item.title}</button
      >
    {/each}
  </div>
  <div class={classNames(styles, 'ratio-formula')}>
    <span class={styles.scope}><i class={styles.scope}>f</i>(n) = {vm.active.fLabel}</span><span class={styles.scope}
      ><i class={styles.scope}>g</i>(n) = {vm.active.gLabel}</span
    >
  </div>
  <div class={classNames(styles, 'ratio-chart-wrap')}>
    <svg
      class={classNames(styles, 'ratio-chart')}
      viewBox="0 0 {vm.width} {vm.height}"
      role="img"
      aria-labelledby="ratio-chart-title ratio-chart-desc"
    >
      <title class={styles.scope} id="ratio-chart-title"
        >Ratio of {vm.active.fLabel} divided by {vm.active.gLabel}</title
      >
      <desc class={styles.scope} id="ratio-chart-desc"
        >As input n grows from 1 to 100, the ratio {vm.active.id === 'strict-upper'
          ? 'approaches zero'
          : vm.active.id === 'tight'
            ? 'approaches a positive constant'
            : 'increases without bound'}.</desc
      >
      <line
        class={classNames(styles, 'axis')}
        x1={vm.padding.left}
        y1={vm.padding.top}
        x2={vm.padding.left}
        y2={vm.chartBottom}
      />
      <line
        class={classNames(styles, 'axis')}
        x1={vm.padding.left}
        y1={vm.chartBottom}
        x2={vm.chartRight}
        y2={vm.chartBottom}
      />
      <line
        class={classNames(styles, 'gridline')}
        x1={vm.padding.left}
        y1={(vm.padding.top + vm.chartBottom) / 2}
        x2={vm.chartRight}
        y2={(vm.padding.top + vm.chartBottom) / 2}
      />
      <path class={classNames(styles, 'ratio-line')} d={vm.path} />
      <text class={classNames(styles, 'axis-label')} x="17" y="24">f(n) / g(n)</text>
      <text class={classNames(styles, 'tick-label')} x={vm.padding.left - 8} y={vm.padding.top + 4} text-anchor="end"
        >{vm.maxRatio.toPrecision(2)}</text
      >
      <text class={classNames(styles, 'tick-label')} x={vm.padding.left - 8} y={vm.chartBottom + 4} text-anchor="end"
        >0</text
      >
      <text class={classNames(styles, 'tick-label')} x={vm.padding.left} y={vm.height - 12}>1</text>
      <text class={classNames(styles, 'tick-label')} x={vm.chartRight} y={vm.height - 12} text-anchor="end">100</text>
      <text
        class={classNames(styles, 'axis-label')}
        x={(vm.padding.left + vm.chartRight) / 2}
        y={vm.height - 2}
        text-anchor="middle">input size n</text
      >
    </svg>
  </div>
  <p class={classNames(styles, 'ratio-conclusion')}>
    <span class={styles.scope}>What to notice</span>{vm.active.conclusion}
  </p>
  <p class={classNames(styles, 'ratio-footnote')}>
    The vertical scale fits the selected comparison, so compare the curve’s trend—not its height across different
    choices.
  </p>
</section>
