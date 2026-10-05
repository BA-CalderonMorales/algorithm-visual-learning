<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import IntroToggle from '../intro-toggle/view.svelte';
  let { title, visible = $bindable(false), children } = $props();
</script>

<div class={classNames(styles, 'intro-heading')}>
  <div class={classNames(styles, 'intro-control')}>
    <IntroToggle bind:visible />
  </div>
  {#if visible}
    <div class={classNames(styles, 'intro-body')}>{@render children()}</div>
  {:else}
    <div class={classNames(styles, 'hero-collapsed-strip')}>
      <span class={classNames(styles, 'intro-label')}>{title}</span>
    </div>
  {/if}
</div>
