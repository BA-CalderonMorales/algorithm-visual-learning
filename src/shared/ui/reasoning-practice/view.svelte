<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { topic } = $props();
  const vm = createViewModel(() => ({ topic }));
</script>

{#if vm.questions.length}
  <section class={classNames(styles, 'reasoning-practice')} aria-label="Independent reasoning practice">
    <p class={classNames(styles, 'overline')}>Make a decision / {vm.index + 1} of {vm.questions.length}</p>
    <fieldset class={styles.scope}>
      <legend class={styles.scope}>{vm.current.prompt}</legend>
      {#each vm.options as option, i}<label class={styles.scope}
          ><input
            class={styles.scope}
            type="radio"
            name="reasoning-choice"
            checked={vm.choice === i}
            onchange={() => vm.choose(i)}
          />{option}</label
        >{/each}
    </fieldset>
    <button class={styles.scope} disabled={vm.choice === null} onclick={vm.check}>Check this decision</button>
    {#if vm.checked}<div class={classNames(styles, 'feedback')} role="status">
        <strong class={styles.scope}
          >{vm.correct ? 'The reasoning fits.' : 'Look at the executed work and assumptions.'}</strong
        >
        <p class={styles.scope}>{vm.current.explanation}</p>
        <button class={styles.scope} onclick={vm.retry}>Retry this decision</button><button
          class={styles.scope}
          onclick={vm.next}>{vm.index === vm.questions.length - 1 ? 'Start again' : 'Next question'}</button
        >
      </div>{/if}
  </section>
{/if}
