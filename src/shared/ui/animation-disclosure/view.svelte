<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { label, children } = $props();
  const vm = createViewModel();
</script>

<details class={classNames(styles, 'animation-disclosure')} ontoggle={vm.toggle}>
  <summary class={styles.scope}>{label}</summary>
  {#if vm.open}{@render children?.()}{/if}
</details>
