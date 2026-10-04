<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import IntroToggle from '../intro-toggle/view.svelte';
  import StudyTabs from '../tabs/view.svelte';
  let {
    title,
    heading = title,
    intro,
    tabs,
    selected = 'explore',
    idPrefix,
    edgeToEdge = false,
    heroVisible = $bindable(false),
    children,
  } = $props();
</script>

{#if heroVisible}
  <section class={classNames(styles, 'library-heading')}>
    <p class={classNames(styles, 'library-label')}>{title}</p>
    <h1 class={styles.scope}>{heading}</h1>
    <p class={styles.scope}>{intro}</p>
    <IntroToggle bind:visible={heroVisible} />
  </section>
{:else}
  <div class={classNames(styles, 'hero-collapsed-strip')}>
    <span class={styles.scope}>{title}</span><IntroToggle bind:visible={heroVisible} />
  </div>
{/if}
<div class={classNames(styles, 'library-workspace home-workspace')}>
  <StudyTabs {tabs} {selected} label="{title} views" {idPrefix} controls="{idPrefix}-panel" />
  <div
    class={classNames(styles, 'library-panel home-panel', { 'edge-to-edge': edgeToEdge })}
    role="tabpanel"
    id="{idPrefix}-panel"
    aria-labelledby="{idPrefix}-{selected}"
    tabindex="0"
  >
    {@render children()}
  </div>
</div>
