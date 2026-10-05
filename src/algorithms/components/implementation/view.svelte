<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import StudyTabs from '../../../shared/ui/tabs/view.svelte';
  import CodeView from '../../../shared/ui/code-view/view.svelte';
  import { createViewModel } from './view-model.svelte.ts';
  import { loadAlgorithmSource } from '../../implementations/source-loader.ts';
  let { algorithm, language } = $props();
  const vm = createViewModel(() => ({ algorithm, language }));
</script>

<StudyTabs tabs={vm.tabs} selected={vm.language.id} label="Choose implementation language" idPrefix="code-tab" />
<div class={classNames(styles, 'code-language-label')}>
  <span class={styles.scope}>{vm.language.description}</span>
  <span class={styles.scope}>{vm.note}</span>
</div>
<CodeView
  sourceKey="{algorithm.id}/{vm.language.id}"
  loadSource={loadAlgorithmSource}
  language={vm.language.id}
  label="{algorithm.name} {vm.language.label} source"
/>
