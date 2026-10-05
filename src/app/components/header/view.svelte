<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import { createHeaderViewModel } from './view-model.svelte.ts';

  let { vm } = $props();
  const header = createHeaderViewModel(() => vm);
</script>

<header class={classNames(styles, 'topbar')}>
  <div class={classNames(styles, 'topbar-leading')}>
    <button
      class={classNames(styles, 'nav-toggle')}
      aria-label={vm.navOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={vm.navOpen}
      aria-controls="study-navigation"
      onclick={() => (vm.navOpen = !vm.navOpen)}>{vm.navOpen ? '×' : '☰'}</button
    >
    <nav class={classNames(styles, 'breadcrumbs')} aria-label="Breadcrumb">
      <ol class={classNames(styles, 'breadcrumb-list', { 'deep-trail': header.breadcrumbs.length > 3 })}>
        {#each header.breadcrumbs as crumb, index}
          <li class={classNames(styles, 'breadcrumb-item', { 'current-crumb': !crumb.href, 'home-crumb': crumb.home })}>
            {#if index > 0}<svg class={classNames(styles, 'crumb-separator')} viewBox="0 0 12 12" aria-hidden="true"
                ><path class={styles.scope} d="m4 2 4 4-4 4"></path></svg
              >{/if}
            {#if crumb.href}
              <a
                class={classNames(styles, 'crumb-link', { 'has-short-label': crumb.shortLabel })}
                href={crumb.href}
                aria-label={crumb.home ? 'Study home' : undefined}
                title={crumb.label}
              >
                {#if crumb.home}<svg class={classNames(styles, 'home-symbol')} viewBox="0 0 20 20" aria-hidden="true"
                    ><path class={styles.scope} d="m3 9 7-6 7 6v8h-5v-5H8v5H3Z"></path></svg
                  >{/if}
                <span class={classNames(styles, 'crumb-label')}>{crumb.label}</span>
                {#if crumb.shortLabel}<span class={classNames(styles, 'crumb-short-label')}>{crumb.shortLabel}</span
                  >{/if}
              </a>
            {:else}
              <span class={classNames(styles, 'crumb-current')} aria-current="page" title={crumb.label}
                >{crumb.label}</span
              >
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  </div>
  <div class={classNames(styles, 'topbar-actions')}>
    <button
      class={classNames(styles, 'fullscreen-toggle')}
      aria-label={vm.fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={vm.fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'}
      onclick={vm.toggleFullscreen}
    >
      {#if vm.fullscreenActive}<svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true"
          ><path class={styles.scope} d="M7 3v4H3M13 3v4h4M7 17v-4H3m10 4v-4h4"></path></svg
        >{:else}<svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true"
          ><path class={styles.scope} d="M3 7V3h4M17 7V3h-4M3 13v4h4m10-4v4h-4"></path></svg
        >{/if}
    </button>
    <button
      class={classNames(styles, 'global-search-trigger')}
      aria-label="Search topics (Ctrl+K)"
      onclick={vm.openSearch}
    >
      <svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true"
        ><circle class={styles.scope} cx="8.5" cy="8.5" r="5.5"></circle><path class={styles.scope} d="m13 13 4 4"
        ></path></svg
      >
      <span class={styles.scope}>Search topics</span><kbd class={styles.scope}>Ctrl K</kbd>
    </button>
    <a
      class={classNames(styles, 'repository-link')}
      href="https://github.com/BA-CalderonMorales/algorithm-visual-learning"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View the project on GitHub"
    >
      <svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true"
        ><path
          class={styles.scope}
          d="M10 1.7a8.3 8.3 0 0 0-2.63 16.18c.42.08.57-.18.57-.4v-1.55c-2.32.5-2.81-.98-2.81-.98-.38-.96-.93-1.22-.93-1.22-.76-.52.06-.51.06-.51.84.06 1.28.86 1.28.86.75 1.28 1.96.91 2.44.7.08-.54.29-.91.53-1.12-1.85-.21-3.79-.93-3.79-4.12 0-.91.33-1.65.86-2.24-.09-.21-.37-1.06.08-2.2 0 0 .7-.22 2.29.86a7.95 7.95 0 0 1 4.17 0c1.59-1.08 2.29-.86 2.29-.86.45 1.14.17 1.99.08 2.2.54.59.86 1.33.86 2.24 0 3.2-1.94 3.9-3.8 4.11.3.26.57.77.57 1.55v2.28c0 .22.15.48.58.4A8.3 8.3 0 0 0 10 1.7Z"
        ></path></svg
      >
      <span class={styles.scope}>GitHub</span><span class={styles.scope} aria-hidden="true">↗</span>
    </a>
  </div>
</header>

<div class={classNames(styles, 'domain-tabs')} aria-label="Learning domains">
  <button
    class={classNames(styles, '', { active: vm.domain === 'algorithms' })}
    onclick={() => vm.openPage('algorithms', 'catalog')}>Algorithms</button
  >
  <button
    class={classNames(styles, '', { active: vm.domain === 'discrete' })}
    onclick={() => vm.openPage('discrete', 'index')}>Discrete math</button
  >
  <button
    class={classNames(styles, '', { active: vm.domain === 'problems' })}
    onclick={() => vm.openPage('problems', 'index')}>Problems</button
  >
  <button
    class={classNames(styles, '', { active: vm.domain === 'complexity' })}
    onclick={() => vm.openPage('complexity', 'index')}>Complexity</button
  >
</div>
