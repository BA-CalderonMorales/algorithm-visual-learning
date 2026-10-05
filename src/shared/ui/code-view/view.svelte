<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { sourceKey, loadSource, language, label } = $props();
  const vm = createViewModel(() => ({ sourceKey, loadSource, language }));
</script>

{#if vm.loading}
  <p class={classNames(styles, 'code-status')} role="status">Loading the implementation…</p>
{:else if vm.error}
  <p class={classNames(styles, 'code-status error')} role="alert">{vm.error}</p>
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class={classNames(styles, 'python-code')}
    role="region"
    aria-label={label}
    data-source-key={vm.sourceKey}
    tabindex="0"
    bind:this={vm.scroll}
  >
    <pre class={styles.scope}>{#each vm.lines as line, index}<span class={classNames(styles, 'code-line')}
          ><span class={classNames(styles, 'line-number')} aria-hidden="true">{index + 1}</span><code
            class={styles.scope}
            >{#each line as token}<span class={classNames(styles, 'token-' + token.type)}>{token.text}</span
              >{/each}</code
          ></span
        >{/each}</pre>
  </div>
{/if}
