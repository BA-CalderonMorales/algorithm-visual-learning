<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import TabWorkspace from '../../../shared/ui/tab-workspace/view.svelte';
  import CodeView from '../../../shared/ui/code-view/view.svelte';
  import { loadProblemSource } from './source-loader.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { id, approach = 'brute', language = 'python-simple', title } = $props();
  const vm = createViewModel(() => ({ id, approach, language }));
</script>

<TabWorkspace
  tabs={vm.strategyTabs}
  selected={approach}
  label="Choose solution approach"
  idPrefix="approach-tab"
  nested
>
  <div class={classNames(styles, 'implementation-main')}>
    <TabWorkspace
      tabs={vm.languageTabs}
      selected={vm.language.id}
      label="Choose implementation language"
      idPrefix="code-tab"
      nested
    >
      <div class={classNames(styles, 'approach-summary')}>
        <div class={classNames(styles, 'approach-heading')}>
          <h2 class={styles.scope}>{vm.strategy.title}</h2>
          <span class={classNames(styles, 'cost')}>Time: {vm.strategy.time} · Extra space: {vm.strategy.space}</span>
        </div>
        <p class={styles.scope}>{vm.strategy.idea}</p>
        <details class={styles.scope}>
          <summary class={styles.scope}>Why this approach / assumptions</summary>
          <p class={styles.scope}>{vm.strategy.change}</p>
          <p class={styles.scope}>{vm.definition.contract}</p>
          <p class={styles.scope}><code class={styles.scope}>{vm.definition.example}</code></p>
          <p class={styles.scope}>{vm.definition.note}</p>
          <p class={styles.scope}>
            Time bounds describe worst-case growth unless marked expected. Brute / Better / Best are solution
            approaches, not input cases. These examples assume the stated input contract rather than validate it.
          </p>
        </details>
      </div>
      <CodeView
        sourceKey="{id}/{approach}/{vm.language.id}"
        loadSource={loadProblemSource}
        language={vm.language.id}
        label="{title} {approach} {vm.language.label} source"
      />
    </TabWorkspace>
  </div>
</TabWorkspace>
