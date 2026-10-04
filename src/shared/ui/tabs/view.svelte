<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';

  let { tabs, selected, label, controls = undefined, idPrefix = 'view-tab' } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ tabs, selected, label, controls, idPrefix }));
</script>

<div class={classNames(styles, 'study-tabs')} role="tablist" aria-label={label}>
  {#each tabs as tab, index}<a
      class={styles.scope}
      href={tab.href}
      role="tab"
      id="{idPrefix}-{tab.id}"
      aria-selected={selected === tab.id}
      aria-controls={controls}
      tabindex={selected === tab.id ? 0 : -1}
      onkeydown={(event) => vm.navigate(event, index)}>{tab.label}</a
    >{/each}
</div>
