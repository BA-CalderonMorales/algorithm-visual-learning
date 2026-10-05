<script>
  import styles from './view.module.css';
  import { classNames } from '../../shared/ui/class-names.ts';
  import IntroHeading from '../../shared/ui/intro-heading/view.svelte';
  import StudyTabs from '../../shared/ui/tabs/view.svelte';
  import Player from '../../shared/playback/player/view.svelte';
  import { createViewModel } from './view-model.svelte.ts';
  import { pointerLegends, describeScene } from './story.ts';
  import { renderPointers } from './renderer.ts';
  import Implementations from './implementations/view.svelte';
  let {
    id,
    view = 'understand',
    approach = 'brute',
    language = 'python-simple',
    heroVisible = $bindable(false),
  } = $props();
  const vm = createViewModel(() => ({ id, view }));
</script>

{#if vm.lesson}
  <IntroHeading title={vm.lesson.title} bind:visible={heroVisible}>
    <header class={classNames(styles, 'problem-heading')}>
      <a class={styles.scope} href="#/problems/two-pointers">← Two Pointers</a>
      <h1 class={styles.scope}>{vm.lesson.title}</h1>
      <p class={styles.scope}>{vm.lesson.idea}</p>
    </header>
  </IntroHeading>
  <div class={classNames(styles, 'problem-workspace')}>
    <StudyTabs
      tabs={vm.tabs}
      selected={view}
      label="{vm.lesson.title} views"
      idPrefix="problem-tab"
      controls="problem-panel"
    />
    <div
      class={classNames(styles, 'problem-panel', { 'implementation-panel': view === 'implementations' })}
      role="tabpanel"
      id="problem-panel"
      aria-labelledby="problem-tab-{view}"
      tabindex="0"
      bind:this={vm.scroll}
    >
      {#if view === 'implementations'}
        <Implementations {id} {approach} {language} title={vm.lesson.title} />
      {:else if view === 'play'}
        <Player
          film={vm.variants[0].film}
          variants={vm.variants}
          legend={pointerLegends[id]}
          renderer={renderPointers}
          sceneDescription={describeScene}
          lessonPlayer
        />
      {:else if view === 'understand'}
        <section class={classNames(styles, 'reasoning')}>
          <p class={classNames(styles, 'eyebrow')}>Two Pointers / {vm.lesson.title}</p>
          <h2 class={styles.scope}>{vm.lesson.question}</h2>
          <p class={classNames(styles, 'task')}>{vm.lesson.task}</p>
          <div class={classNames(styles, 'anchor')}>{vm.lesson.anchor}</div>
          <ol class={classNames(styles, 'flow')}>
            {#each vm.lesson.steps as step, index}<li class={styles.scope}>
                <span class={styles.scope}>0{index + 1}</span>
                <div class={styles.scope}>
                  <h3 class={styles.scope}>{step.title}</h3>
                  <p class={styles.scope}>{step.body}</p>
                </div>
              </li>{/each}
          </ol>
          <dl class={classNames(styles, 'notes')}>
            <div class={styles.scope}>
              <dt class={styles.scope}>Before starting</dt>
              <dd class={styles.scope}>{vm.lesson.precondition}</dd>
            </div>
            <div class={styles.scope}>
              <dt class={styles.scope}>Why the move is safe</dt>
              <dd class={styles.scope}>{vm.lesson.proof}</dd>
            </div>
            <div class={styles.scope}>
              <dt class={styles.scope}>Easy trap</dt>
              <dd class={styles.scope}>{vm.lesson.trap}</dd>
            </div>
            <div class={styles.scope}>
              <dt class={styles.scope}>{vm.lesson.time}<br />{vm.lesson.space}</dt>
              <dd class={styles.scope}>{vm.lesson.cost}</dd>
            </div>
          </dl>
        </section>
      {:else}
        <section class={classNames(styles, 'reasoning')}>
          <p class={classNames(styles, 'eyebrow')}>Explain the decision before revealing the answer</p>
          <h2 class={styles.scope}>Can you justify the next move?</h2>
          <div class={classNames(styles, 'checks')}>
            {#each vm.lesson.checks as check, index}<article class={styles.scope}>
                <span class={classNames(styles, 'eyebrow')}>0{index + 1}</span>
                <h3 class={styles.scope}>{check.question}</h3>
                <details class={styles.scope}>
                  <summary class={styles.scope}>Check your reasoning</summary>
                  <p class={styles.scope}>{check.answer}</p>
                </details>
              </article>{/each}
          </div>
        </section>
      {/if}
      {#if view !== 'implementations'}<footer class={classNames(styles, 'lesson-links')}>
          <a class={styles.scope} href={vm.lesson.reference} target="_blank" rel="noopener noreferrer"
            >Go deeper on Hello Interview ↗</a
          >
          {#each vm.lesson.connections as link}<a class={styles.scope} href={link.href}>{link.title} →</a>{/each}
          <p class={styles.scope}>
            Original study explanations and visuals. Pattern reference: Hello Interview; no affiliation.
          </p>
        </footer>{/if}
    </div>
  </div>
{/if}
