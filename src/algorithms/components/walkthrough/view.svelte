<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import NavigationLink from '../../../shared/ui/navigation-link/view.svelte';

  let { name, src, onShortcut } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ name, src, onShortcut }));
</script>

<div class={classNames(styles, 'walkthrough-host')} aria-busy={vm.status === 'loading'}>
  {#key vm.attempt}
    <iframe
      bind:this={vm.frame}
      class={classNames(styles, 'walkthrough-frame')}
      title="{name} step-by-step walkthrough"
      {src}
    ></iframe>
  {/key}
  {#if vm.status === 'loading'}
    <div class={classNames(styles, 'walkthrough-status')} role="status">Loading the interactive walkthrough…</div>
  {:else if vm.status === 'error'}
    <div class={classNames(styles, 'walkthrough-status')} role="alert">
      <strong class={styles.scope}>The walkthrough couldn’t open.</strong>
      <span class={styles.scope}>Try reloading it, or open it in its own tab.</span>
      <button class={styles.scope} onclick={() => (vm.attempt += 1)}>Reload walkthrough</button>
      <NavigationLink href={src} label="Open standalone" external />
    </div>
  {/if}
</div>
