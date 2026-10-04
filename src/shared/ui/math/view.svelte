<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';

  let { expression, label = undefined } = $props();
</script>

<div class={classNames(styles, 'study-math')} aria-label={label}>
  <!-- expression is authored MathML from domain lesson models, never external input. -->
  {@html `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${expression}</mrow></math>`}
</div>
