<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  let { visible = $bindable(false) } = $props();
</script>

<button
  class={classNames(styles, 'intro-toggle')}
  aria-label={visible ? 'Hide intro' : 'Show intro'}
  aria-expanded={visible}
  onclick={() => (visible = !visible)}
>
  <svg class={styles.scope} viewBox="0 0 24 24" aria-hidden="true">
    <path class={styles.scope} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path>
    <circle class={styles.scope} cx="12" cy="12" r="3"></circle>
    {#if visible}<path class={styles.scope} d="m3 3 18 18"></path>{/if}
  </svg>
  <span class={classNames(styles, 'intro-tooltip')} aria-hidden="true">{visible ? 'Hide intro' : 'Show intro'}</span>
</button>
