<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import StudyTabs from '../tabs/view.svelte';
  import { createViewModel } from './view-model.svelte.ts';
  let { tabs, selected, label, controls, idPrefix, nested = false, overlay = false, children } = $props();
  const vm = createViewModel(() => ({ tabs, selected, overlay }));
</script>

<div
  class={classNames(styles, 'tab-workspace', { collapsed: vm.collapsed, nested, overlay })}
  bind:this={vm.host}
  style:--section-top="{vm.stickyTop}px"
>
  <div class={classNames(styles, 'section-rail')}>
    <button
      class={classNames(styles, 'section-toggle')}
      aria-expanded={!vm.collapsed}
      aria-controls="{idPrefix}-sections"
      aria-label="{vm.collapsed ? 'Show' : 'Hide'} {label}"
      onclick={vm.toggle}
    >
      <span class={styles.scope} aria-hidden="true">{vm.collapsed ? '☰' : '×'}</span><span
        class={classNames(styles, 'toggle-label')}>Sections · {vm.currentLabel}</span
      >
    </button>
    <div class={classNames(styles, 'section-options')} id="{idPrefix}-sections" hidden={vm.collapsed}>
      <StudyTabs {tabs} {selected} {label} {controls} {idPrefix} orientation="vertical" onSelect={vm.select} />
    </div>
  </div>
  <div class={classNames(styles, 'section-content')}>{@render children()}</div>
</div>
