<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import IntroHeading from '../intro-heading/view.svelte';
  import TabWorkspace from '../tab-workspace/view.svelte';
  import { createViewModel } from './view-model.svelte.ts';
  let {
    title,
    heading = title,
    intro,
    tabs,
    selected = 'explore',
    idPrefix,
    edgeToEdge = false,
    tabOrientation = 'vertical',
    heroVisible = $bindable(false),
    children,
  } = $props();
  const vm = createViewModel(() => ({ selected, tabOrientation, idPrefix, title }));
</script>

<IntroHeading {title} bind:visible={heroVisible}>
  <section class={classNames(styles, 'library-heading')}>
    <h1 class={styles.scope}>{heading}</h1>
    <p class={styles.scope}>{intro}</p>
  </section>
</IntroHeading>
<div class={classNames(styles, 'library-workspace home-workspace')}>
  <TabWorkspace overlay {tabs} {selected} label="{title} views" {idPrefix} controls="{idPrefix}-panel">
    <div
      class={classNames(styles, 'library-panel home-panel', { 'edge-to-edge': edgeToEdge })}
      role="tabpanel"
      id="{idPrefix}-panel"
      aria-labelledby="{idPrefix}-{selected}"
      tabindex="0"
      bind:this={vm.panel}
    >
      {@render children()}
    </div>
  </TabWorkspace>
</div>
