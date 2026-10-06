<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  let { answer, label = 'Show the reasoning' } = $props();
</script>

<details class={classNames(styles, 'reasoning-disclosure')}>
  <summary class={styles.scope}>{label}</summary>
  <p class={styles.scope}>{answer}</p>
</details>
