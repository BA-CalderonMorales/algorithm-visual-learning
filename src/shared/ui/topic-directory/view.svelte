<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import LibraryLayout from '../library-layout/view.svelte';
  import LibraryEntry from '../library-entry/view.svelte';
  import DomainConnections from '../domain-connections/view.svelte';
  import { directoryTabs } from '../../study/library.ts';
  import { topicEntries } from './model.ts';
  let { collection, lessons, view = 'explore', domain, heroVisible = $bindable(false) } = $props();
</script>

<LibraryLayout
  title={collection.title}
  intro={collection.intro}
  tabs={directoryTabs('#/' + domain)}
  selected={view}
  idPrefix="{domain}-directory-tab"
  bind:heroVisible
>
  {#if view === 'explore'}
    <section class={classNames(styles, 'topic-directory')} aria-label="{collection.title} topics">
      {#each topicEntries(collection, lessons) as entry, index}
        <LibraryEntry {entry} number={index + 1} />
      {/each}
    </section>
  {:else}
    <DomainConnections {domain} explanation={collection.bridge} />
  {/if}
</LibraryLayout>
