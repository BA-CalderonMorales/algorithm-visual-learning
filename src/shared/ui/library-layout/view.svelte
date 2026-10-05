<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import IntroHeading from '../intro-heading/view.svelte';
  import StudyTabs from '../tabs/view.svelte';
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
  const vm = createViewModel(() => ({ selected, tabOrientation }));
</script>

<IntroHeading {title} bind:visible={heroVisible}>
  <section class={classNames(styles, 'library-heading')}>
    <p class={classNames(styles, 'library-label')}>{title}</p>
    <h1 class={styles.scope}>{heading}</h1>
    <p class={styles.scope}>{intro}</p>
  </section>
</IntroHeading>
<div
  class={classNames(styles, 'library-workspace home-workspace', {
    'vertical-tabs': tabOrientation === 'vertical',
    'rail-collapsed': tabOrientation === 'vertical' && vm.collapsed,
  })}
>
  <div class={classNames(styles, 'library-navigation', { 'vertical-navigation': tabOrientation === 'vertical' })}>
    {#if tabOrientation === 'vertical'}
      <button
        class={classNames(styles, 'rail-toggle')}
        type="button"
        aria-label={vm.collapsed ? 'Expand page tabs' : 'Collapse page tabs'}
        title={vm.collapsed ? 'Expand page tabs' : 'Collapse page tabs'}
        aria-expanded={!vm.collapsed}
        aria-controls="{idPrefix}-navigation"
        onclick={vm.toggleRail}
      >
        <svg
          class={styles.scope}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <rect class={styles.scope} x="3" y="4" width="18" height="16" />
          <path class={styles.scope} d="M9 4v16" />
          <path class={styles.scope} d={vm.collapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} />
        </svg>
      </button>
    {/if}
    <div
      class={classNames(styles, 'rail-tabs')}
      id="{idPrefix}-navigation"
      hidden={tabOrientation === 'vertical' && vm.collapsed}
    >
      <StudyTabs
        {tabs}
        {selected}
        label="{title} views"
        {idPrefix}
        controls="{idPrefix}-panel"
        orientation={tabOrientation}
      />
    </div>
  </div>
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
</div>
