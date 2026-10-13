<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import IntroHeading from '../../../shared/ui/intro-heading/view.svelte';
  import TabWorkspace from '../../../shared/ui/tab-workspace/view.svelte';
  import NavigationLink from '../../../shared/ui/navigation-link/view.svelte';
  import CodeWorkbench from '../../../shared/ui/code-workbench/view.svelte';
  import { problemLabs } from '../../code-traces.ts';
  import { patterns } from '../../catalog/model.ts';
  import { createViewModel } from './view-model.svelte.ts';
  let { topic, view = 'understand', heroVisible = $bindable(false) } = $props();
  const vm = createViewModel(() => ({ topic }));
  const pattern = $derived(patterns.find((p) => p.id === vm.lesson?.pattern));
</script>

{#if vm.lesson}
  <IntroHeading title={vm.lesson.title} bind:visible={heroVisible}>
    <header class={classNames(styles, 'heading')}>
      <a class={styles.scope} href={pattern.href}>← {pattern.title}</a>
      <h1 class={styles.scope}>{vm.lesson.title}</h1>
      <p class={styles.scope}>{vm.lesson.idea}</p>
    </header>
  </IntroHeading>
  <section class={classNames(styles, 'workspace')} aria-label="{vm.lesson.title} lesson">
    <TabWorkspace
      tabs={vm.tabs}
      selected={view}
      label="{vm.lesson.title} views"
      idPrefix="catalog-lesson-tab"
      controls="catalog-lesson-panel"
    >
      <div
        class={classNames(styles, 'panel')}
        id="catalog-lesson-panel"
        role="tabpanel"
        aria-labelledby="catalog-lesson-tab-{view}"
        tabindex="0"
      >
        {#if view === 'understand'}
          <h2 class={styles.scope}>What stays true?</h2>
          <p class={classNames(styles, 'invariant')}>{vm.lesson.invariant}</p>
          <h2 class={styles.scope}>A small example</h2>
          <p class={styles.scope}>{vm.lesson.example}</p>
          <ol class={classNames(styles, 'steps')}>
            {#each vm.lesson.trace as scene}<li class={styles.scope}>
                <strong class={styles.scope}>{scene.state}</strong>
                <p class={styles.scope}>{scene.why}</p>
              </li>{/each}
          </ol>
          <dl class={classNames(styles, 'costs')}>
            <dt class={styles.scope}>Time</dt>
            <dd class={styles.scope}>{vm.lesson.time}</dd>
            <dt class={styles.scope}>Space</dt>
            <dd class={styles.scope}>{vm.lesson.space}</dd>
          </dl>
          <p class={classNames(styles, 'caution')}>
            <strong class={styles.scope}>Watch for this.</strong>
            {vm.lesson.trap}
          </p>
          <NavigationLink href={vm.tabs[1].href} label="Trace the decisions" />
        {:else if view === 'play'}
          {#if problemLabs[vm.lesson.id]}{#key vm.lesson.id}<CodeWorkbench
                definition={problemLabs[vm.lesson.id]}
              />{/key}{:else}
            <p class={classNames(styles, 'overline')}>Step {vm.step + 1} of {vm.lesson.trace.length}</p>
            <p class={styles.scope}>{vm.lesson.example}</p>
            {#key vm.step}<div class={classNames(styles, 'scene')} aria-live="polite" aria-atomic="true">
                <h2 class={styles.scope}>{vm.scene.state}</h2>
                <p class={styles.scope}>{vm.scene.why}</p>
              </div>{/key}
            <div class={classNames(styles, 'controls')}>
              <button class={styles.scope} disabled={vm.step === 0} onclick={() => vm.move(-1)}
                >← Previous decision</button
              ><button class={styles.scope} disabled={vm.step === vm.lesson.trace.length - 1} onclick={() => vm.move(1)}
                >Next decision →</button
              >
            </div>
            <p class={classNames(styles, 'invariant')}>
              <strong class={styles.scope}>Still true:</strong>
              {vm.lesson.invariant}
            </p>
            <NavigationLink href={vm.tabs[2].href} label="Try without the trace" />
          {/if}
        {:else}
          <fieldset class={classNames(styles, 'question')}>
            <legend class={styles.scope}>{vm.lesson.question}</legend>
            {#each vm.options as option, index}<label class={styles.scope}
                ><input
                  class={styles.scope}
                  type="radio"
                  name="catalog-answer"
                  checked={vm.choice === index}
                  onchange={() => vm.choose(index)}
                />{option}</label
              >{/each}
          </fieldset>
          <button class={classNames(styles, 'check')} disabled={vm.choice === null} onclick={vm.check}
            >Check my reasoning</button
          >
          {#if vm.submitted}<div class={classNames(styles, 'feedback')} role="status">
              <strong class={styles.scope}
                >{vm.correct ? 'That decision holds.' : 'Revisit the rule behind the move.'}</strong
              >
              <p class={styles.scope}>{vm.lesson.explanation}</p>
              <button class={styles.scope} onclick={vm.retry}>Try again</button>
            </div>{/if}
          <label class={classNames(styles, 'reflection')} for="reasoning-note"
            >Explain what stays true, then name an input where this method would fail.</label
          >
          <textarea
            class={styles.scope}
            id="reasoning-note"
            rows="4"
            maxlength="2000"
            bind:value={vm.reflection}
            placeholder="Use your own words…"></textarea>
          <p class={classNames(styles, 'overline')}>Your note stays in this lesson visit.</p>
          <NavigationLink href={vm.tabs[0].href} label="Compare with the explanation" />
        {/if}
      </div>
    </TabWorkspace>
  </section>
{/if}
