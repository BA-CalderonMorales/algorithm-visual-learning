<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';

  let { vm } = $props();
</script>

<footer class={classNames(styles, 'site-footer')}>
  <span class={styles.scope}>DSA Study Studio</span>
</footer>
