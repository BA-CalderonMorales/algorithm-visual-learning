<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import StudyTabs from '../../../shared/ui/tabs/view.svelte';
  let { vm } = $props();
</script>

{#if vm.pythonLoading}
  <p class={classNames(styles, 'code-status')}>Loading the implementation…</p>
{:else if vm.pythonError}
  <p class={classNames(styles, 'code-status error')}>{vm.pythonError}</p>
{:else}
  <StudyTabs
    tabs={[
      ['python-simple', 'Python (simple)', 'python/simple'],
      ['python-typed', 'Python (typed)', 'python/typed'],
      ['javascript', 'JavaScript', 'javascript'],
      ['typescript', 'TypeScript', 'typescript'],
    ].map(([id, label, path]) => ({ id, label, href: `#/algorithms/${vm.selectedAlgorithm.id}/${path}` }))}
    selected={vm.implementationLanguage}
    label="Choose implementation language"
    idPrefix="code-tab"
  />
  <div class={classNames(styles, 'code-language-label')}>
    {vm.implementationLanguage === 'python-simple'
      ? 'Python · intuition-first'
      : vm.implementationLanguage === 'python-typed'
        ? 'Python · typed reference'
        : vm.implementationLanguage === 'javascript'
          ? 'JavaScript · implementation'
          : 'TypeScript · typed implementation'}
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class={classNames(styles, 'python-code')}
    role="region"
    aria-label="{vm.selectedAlgorithm.name} {vm.implementationLanguage} source"
    tabindex="0"
  >
    <pre class={styles.scope}>{#each vm.highlightedLines as line, index}<span class={classNames(styles, 'code-line')}
          ><span class={classNames(styles, 'line-number')} aria-hidden="true">{index + 1}</span><code
            class={styles.scope}
            >{#each line as token}<span class={classNames(styles, 'token-' + token.type)}>{token.text}</span
              >{/each}{#if line.length === 0}<span class={styles.scope} aria-hidden="true"></span>{/if}</code
          ></span
        >{/each}</pre>
  </div>
{/if}
