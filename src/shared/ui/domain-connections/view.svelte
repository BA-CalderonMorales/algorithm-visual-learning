<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import LibraryEntry from '../library-entry/view.svelte';
  import { relatedDomains } from '../../study/library.ts';
  let { domain, explanation } = $props();
</script>

<section class={classNames(styles, 'domain-connections')} aria-label="Connections to other domains">
  <header class={styles.scope}>
    <p class={classNames(styles, 'library-label')}>One idea across subjects</p>
    <h2 class={styles.scope}>Connect what you learn.</h2>
    <p class={styles.scope}>{explanation}</p>
  </header>
  {#each relatedDomains(domain) as entry, index}
    <LibraryEntry {entry} number={index + 1} />
  {/each}
</section>
