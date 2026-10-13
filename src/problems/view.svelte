<script>
  import styles from './view.module.css';
  import { classNames } from '../shared/ui/class-names.ts';
  import LibraryLayout from '../shared/ui/library-layout/view.svelte';
  import LibraryEntry from '../shared/ui/library-entry/view.svelte';
  import DomainConnections from '../shared/ui/domain-connections/view.svelte';
  import NavigationLink from '../shared/ui/navigation-link/view.svelte';
  import CodeWorkbench from '../shared/ui/code-workbench/view.svelte';
  import { linkedFundamentals, binaryTrace } from './code-traces.ts';
  import { directoryTabs } from '../shared/study/library.ts';
  import { pattern, problems, problemHref } from './model.ts';
  import { patterns, catalogLessons, catalogHref } from './catalog/model.ts';
  let { view = 'explore', patternId = '', heroVisible = $bindable(false) } = $props();
  const selected = $derived(patterns.find((p) => p.id === patternId));
  const entries = $derived([
    ...(patternId === 'two-pointers'
      ? problems.map((p) => ({ ...p, href: problemHref(p.id), play: problemHref(p.id, 'play') }))
      : []),
    ...catalogLessons
      .filter((p) => p.pattern === patternId)
      .map((p) => ({ ...p, href: catalogHref(p), play: catalogHref(p, 'play') })),
  ]);
</script>

<LibraryLayout
  title={selected?.title ?? 'Problems'}
  heading="Learn the move. Know why it is safe."
  intro={selected?.description ??
    'Explore reusable problem-solving patterns. Learn the rule, trace a fresh example, then make the decision yourself.'}
  tabs={directoryTabs(selected?.href ?? '#/problems')}
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
    {#if selected}<section class={classNames(styles, 'pattern-intro')}>
        <h2 class={styles.scope}>{selected.question}</h2>
        <p class={styles.scope}>{selected.description}</p>
      </section>
    {:else}
      {#each patterns as entry, index}<LibraryEntry
          entry={{ ...entry, links: [{ title: 'Explore ' + entry.title, href: entry.href }] }}
          number={index + 1}
        />{/each}
    {/if}
    {#if patternId === 'linked-list'}{#key patternId}<CodeWorkbench
          definition={linkedFundamentals}
        />{/key}{:else if patternId === 'binary-search'}{#key patternId}<CodeWorkbench
          definition={{
            title: 'Binary search fundamentals',
            intro: 'Trace a half-open interval before applying the pattern to harder problems. Target = 5.',
            input: '4, 1, 6, 2, 5',
            build: binaryTrace,
          }}
        />{/key}{/if}
    {#if selected}<section class={classNames(styles, 'problem-list')} aria-label="{selected.title} learning path">
        {#each entries as problem, index}
          <article class={classNames(styles, 'problem-row')}>
            <span class={classNames(styles, 'order')}>0{index + 1}</span>
            <div class={styles.scope}>
              <h2 class={styles.scope}><a class={styles.scope} href={problem.href}>{problem.title}</a></h2>
              <p class={styles.scope}>{problem.idea}</p>
            </div>
            <div class={classNames(styles, 'problem-actions')}>
              <NavigationLink href={problem.play} label="Trace" accessibleLabel="Watch {problem.title}" />
            </div>
          </article>
        {/each}
      </section>{/if}
    {#if patternId === 'two-pointers'}<p class={classNames(styles, 'reference')}>
        Pattern reference: <a class={styles.scope} href={pattern.reference} target="_blank" rel="noopener noreferrer"
          >Hello Interview’s Two Pointers guide ↗</a
        >.
      </p>{/if}
    {#if !patternId}<p class={classNames(styles, 'reference')}>
        <a
          class={styles.scope}
          href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/issues/new?title=Content%20request"
          target="_blank"
          rel="noopener noreferrer">Vote For New Content ↗</a
        > — propose a topic or react to an existing GitHub request.
      </p>{/if}
  {/if}
</LibraryLayout>
