<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import { createReadingNavigation } from './view-model.svelte.ts';
  let { vm } = $props();
  const navigation = createReadingNavigation(() => vm);
</script>

<nav class={classNames(styles, 'reading-navigation')} aria-label="Previous and next topics">
  {#if navigation.links.previous}
    <a class={classNames(styles, 'reading-link previous-topic')} href={navigation.links.previous.href} rel="prev">
      <span class={classNames(styles, 'direction')}
        ><span class={styles.scope} aria-hidden="true">←</span> Previous topic</span
      >
      <strong class={styles.scope}>{navigation.links.previous.label}</strong>
      <span class={classNames(styles, 'section-label')}>{navigation.links.previous.section}</span>
    </a>
  {/if}
  {#if navigation.links.next}
    <a class={classNames(styles, 'reading-link next-topic')} href={navigation.links.next.href} rel="next">
      <span class={classNames(styles, 'direction')}
        >Next topic <span class={styles.scope} aria-hidden="true">→</span></span
      >
      <strong class={styles.scope}>{navigation.links.next.label}</strong>
      <span class={classNames(styles, 'section-label')}>{navigation.links.next.section}</span>
    </a>
  {/if}
</nav>
