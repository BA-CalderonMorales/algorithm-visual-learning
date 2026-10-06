<script>
  import styles from './view.module.css';
  import { classNames } from '../shared/ui/class-names.ts';
  import LibraryLayout from '../shared/ui/library-layout/view.svelte';
  import LibraryEntry from '../shared/ui/library-entry/view.svelte';
  import DomainConnections from '../shared/ui/domain-connections/view.svelte';
  import NavigationLink from '../shared/ui/navigation-link/view.svelte';
  import { directoryTabs } from '../shared/study/library.ts';
  import { pattern, problems, problemHref } from './model.ts';
  let { view = 'explore', bucket = false, heroVisible = $bindable(false) } = $props();
</script>

<LibraryLayout
  title={bucket ? 'Two Pointers' : 'Problems'}
  heading="Learn the move. Know why it is safe."
  intro="Interview patterns, worked visually. Start with one bucket and explain the decisions before memorizing code."
  tabs={directoryTabs(bucket ? pattern.href : '#/problems')}
  selected={view}
  idPrefix="problems-tab"
  bind:heroVisible
>
  {#if view === 'connections'}
    <DomainConnections
      domain="problems"
      explanation="A pattern is useful when you can justify it, trace it, and bound its work. Connect the interview problem back to those fundamentals."
    />
  {:else}
    {#if bucket}<section class={classNames(styles, 'pattern-intro')}>
        <h2 class={styles.scope}>{pattern.question}</h2>
        <p class={styles.scope}>{pattern.description}</p>
      </section>
    {:else}<LibraryEntry entry={{ ...pattern, links: [{ title: 'Explore Two Pointers', href: pattern.href }] }} />{/if}
    {#if bucket}<section class={classNames(styles, 'problem-list')} aria-label="Two Pointers learning path">
        {#each problems as problem, index}
          <article class={classNames(styles, 'problem-row')}>
            <span class={classNames(styles, 'order')}>0{index + 1}</span>
            <div class={styles.scope}>
              <h2 class={styles.scope}><a class={styles.scope} href={problemHref(problem.id)}>{problem.title}</a></h2>
              <p class={styles.scope}>{problem.idea}</p>
            </div>
            <div class={classNames(styles, 'problem-actions')}>
              <NavigationLink
                href={problemHref(problem.id, 'play')}
                label="Watch"
                accessibleLabel="Watch {problem.title}"
              />
            </div>
          </article>
        {/each}
      </section>{/if}
    <p class={classNames(styles, 'reference')}>
      Pattern grouping inspired by <a
        class={styles.scope}
        href={pattern.reference}
        target="_blank"
        rel="noopener noreferrer">Hello Interview’s Two Pointers guide ↗</a
      >. Our examples and animations are original; visit their guide for deeper interview preparation. No affiliation.
    </p>
  {/if}
</LibraryLayout>
