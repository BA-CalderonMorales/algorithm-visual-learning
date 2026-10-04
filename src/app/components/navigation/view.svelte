<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import { createNavigationViewModel } from './view-model.svelte.ts';

  let { vm } = $props();
  const navigation = createNavigationViewModel(() => vm);
</script>

<div
  id="study-navigation"
  bind:this={navigation.element}
  class={classNames(styles, 'sidebar', { 'nav-open': vm.navOpen })}
  role="dialog"
  aria-modal="true"
  aria-label="Study guide navigation"
  aria-hidden={!vm.navOpen}
  inert={!vm.navOpen}
>
  <div class={classNames(styles, 'sidebar-heading')}>
    <a class={classNames(styles, 'brand')} href="#/home" onclick={navigation.close}>
      <span class={classNames(styles, 'brand-mark')} aria-hidden="true">⋈</span>
      <span class={styles.scope}>
        <strong class={styles.scope}>DSA Study Studio</strong>
        <small class={styles.scope}>See the idea. Follow the why.</small>
      </span>
    </a>
    <button
      class={classNames(styles, 'close-navigation')}
      aria-label="Close study navigation"
      onclick={navigation.close}
    >
      <span class={styles.scope} aria-hidden="true">×</span>
    </button>
  </div>

  <nav class={classNames(styles, 'navigation-scroll')} aria-label="Learning topics">
    <a
      class={classNames(styles, 'nav-link home-link', { active: navigation.homeActive })}
      href="#/home"
      aria-current={navigation.homeActive ? 'page' : undefined}
      onclick={navigation.close}
    >
      <span class={classNames(styles, 'home-icon')} aria-hidden="true">⌂</span> Study home
    </a>

    {#each navigation.groups as group (group.id)}
      <section class={classNames(styles, 'domain-group', { 'current-domain': navigation.isCurrentDomain(group.id) })}>
        <button
          class={classNames(styles, 'domain-toggle')}
          aria-expanded={navigation.isExpanded(group.id)}
          aria-controls="navigation-{group.id}"
          onclick={() => navigation.toggle(group.id)}
        >
          <span class={classNames(styles, 'domain-icon')} aria-hidden="true">{group.symbol}</span>
          <span class={classNames(styles, 'domain-name')}>{group.label}</span>
          <span class={classNames(styles, 'topic-count')} aria-label="{group.topics.length} topics"
            >{group.topics.length}</span
          >
          <svg class={classNames(styles, 'disclosure')} viewBox="0 0 16 16" aria-hidden="true">
            <path class={styles.scope} d="m6 3 5 5-5 5"></path>
          </svg>
        </button>
        <div
          id="navigation-{group.id}"
          class={classNames(styles, 'domain-topics')}
          hidden={!navigation.isExpanded(group.id)}
        >
          <a
            class={classNames(styles, 'nav-link overview-link', { active: navigation.isActive(group.overview) })}
            href={group.overview.href}
            aria-current={navigation.isActive(group.overview) ? 'page' : undefined}
            onclick={navigation.close}>{group.overview.label}</a
          >
          {#each group.topics as topic (topic.key)}
            <a
              class={classNames(styles, 'nav-link topic-link', { active: navigation.isActive(topic) })}
              href={topic.href}
              aria-current={navigation.isActive(topic) ? 'page' : undefined}
              onclick={navigation.close}>{topic.label}</a
            >
          {/each}
        </div>
      </section>
    {/each}
  </nav>

  <footer class={classNames(styles, 'sidebar-footer')}>
    <a
      class={classNames(styles, 'nav-link contribute-link')}
      href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/CONTRIBUTING.md"
      target="_blank"
      rel="noopener noreferrer">Contribute to the guide <span class={styles.scope} aria-hidden="true">↗</span></a
    >
  </footer>
</div>
