<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { id } = $props();
  const vm = createViewModel(() => ({ id }));
</script>

<section class={classNames(styles, 'trace-practice')} aria-label="Complete an independent sorting trace">
  <h2 class={styles.scope}>Carry the procedure through.</h2>
  <p class={styles.scope}>
    {id === 'shell'
      ? 'Fresh example. Gaps 3, then 1. Highlighted indices belong to the current gap group.'
      : 'Fresh example. Median-of-three, pivot at high−1, endpoint sentinels. Complete the first partition only.'}
  </p>
  <ol class={classNames(styles, 'slots')} aria-label="Current array">
    {#each vm.current.values as value, i}<li
        class={classNames(styles, 'slot', { active: vm.current.group.includes(i) })}
      >
        <strong class={styles.scope}>{value}</strong><small class={styles.scope}>index {i}</small>
      </li>{/each}
  </ol>
  <p class={styles.scope}>
    {vm.current.title}{#if vm.current.held !== null}
      · Held: {vm.current.held}{/if}
  </p>
  <p class={classNames(styles, 'why')}>{vm.current.why}</p>
  {#if vm.next}
    <fieldset class={styles.scope}>
      <legend class={styles.scope}>Predict: {vm.next.title}</legend>
      {#each vm.options as option, i}<label class={styles.scope}
          ><input
            class={styles.scope}
            type="radio"
            name="trace-answer"
            checked={vm.choice === i}
            onchange={() => vm.choose(i)}
          /><code class={styles.scope}>[{option}]</code></label
        >{/each}
    </fieldset>
    <button class={styles.scope} disabled={vm.choice === null} onclick={vm.check}>Check next state</button>
    {#if vm.checked}<p class={styles.scope} role="status">
        {vm.correct
          ? 'This state follows the move. ' + vm.next.why
          : 'Keep the operation local to the indicated indices. Reconsider which values the stated move changes.'}
      </p>{/if}
    <button class={styles.scope} disabled={!vm.checked || !vm.correct} onclick={vm.advance}>Continue trace →</button>
  {:else}<p class={styles.scope} role="status">
      Trace complete. Explain what the final state guarantees before revisiting the lesson.
    </p>{/if}
  <button class={styles.scope} onclick={vm.restart}>Restart fresh trace</button>
</section>
