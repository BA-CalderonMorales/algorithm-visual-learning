<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';

  let {
    tabs,
    selected,
    label,
    controls = undefined,
    idPrefix = 'view-tab',
    orientation = 'horizontal',
    compact = false,
    onSelect = undefined,
  } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ tabs, selected, label, controls, idPrefix, orientation, onSelect }));
</script>

<div
  class={classNames(styles, 'study-tabs', { vertical: orientation === 'vertical', compact })}
  role="tablist"
  aria-label={label}
  aria-orientation={orientation}
>
  {#each tabs as tab, index}<a
      class={styles.scope}
      href={tab.href}
      role="tab"
      id="{idPrefix}-{tab.id}"
      aria-selected={selected === tab.id}
      aria-controls={controls}
      tabindex={selected === tab.id ? 0 : -1}
      onclick={(event) => vm.select(event, index)}
      onkeydown={(event) => vm.navigate(event, index)}>{tab.label}</a
    >{/each}
</div>
