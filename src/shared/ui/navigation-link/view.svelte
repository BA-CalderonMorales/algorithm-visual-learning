<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  let { href, label, number = null, external = false, primary = false, accessibleLabel = undefined } = $props();
</script>

<a
  class={classNames(styles, 'navigation-link', { primary })}
  {href}
  aria-label={accessibleLabel}
  target={external ? '_blank' : undefined}
  rel={external ? 'noopener noreferrer' : undefined}
>
  {#if number}<span class={styles.number} aria-hidden="true">{number}</span>{/if}
  <span class={styles.label}>{label}</span>
  <svg
    class={styles.arrow}
    viewBox="0 0 20 20"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path d={external ? 'M5 15 15 5M5 5h10v10' : 'M3 10h13m-5-5 5 5-5 5'} />
  </svg>
  {#if external}<span class={styles['sr-only']}> (opens in a new tab)</span>{/if}
</a>
