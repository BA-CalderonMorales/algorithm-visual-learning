<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import ConceptFilm from '../../playback/player/view.svelte';
  import StudyMath from '../math/view.svelte';
  import CancellationSum from '../../../discrete/telescoping/components/cancellation/view.svelte';
  import StudyTabs from '../tabs/view.svelte';
  import AsymptoticRatio from '../../../complexity/asymptotic/components/ratio/view.svelte';
  let { lesson, view = 'understand', film, variants = [], legend = [] } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ lesson, view }));
</script>

<section class={classNames(styles, 'study-workspace')} aria-label="{lesson.title} lesson">
  <StudyTabs
    tabs={vm.lessonTabs.map((tab) => ({ ...tab, href: vm.lessonHref(lesson, tab.id) }))}
    selected={view}
    label="{lesson.title} views"
    controls="study-panel"
    idPrefix="study-tab"
  />
  <div
    class={classNames(styles, 'study-panel')}
    role="tabpanel"
    id="study-panel"
    aria-labelledby="study-tab-{view}"
    tabindex="0"
  >
    {#if view === 'visualize'}
      <div class={classNames(styles, 'study-visual-scroll')}>
        {#if lesson.id === 'asymptotic'}<AsymptoticRatio comparisons={lesson.comparisons} />{:else}<ConceptFilm
            {film}
            {variants}
            {legend}
            embedded
            lessonPlayer
          />{/if}
      </div>
    {:else}
      {#if view === 'examples'}
        <nav class={classNames(styles, 'example-picker')} aria-label="Worked examples">
          {#each lesson.examples as item, index}<button
              class={classNames(styles, '', { active: vm.exampleIndex === index })}
              aria-pressed={vm.exampleIndex === index}
              onclick={() => vm.chooseExample(index)}><span class={styles.scope}>{index + 1}</span>{item.title}</button
            >{/each}
        </nav>
      {/if}
      <div class={classNames(styles, 'study-scroll')} bind:this={vm.scroller}>
        {#if view === 'understand'}
          <div class={classNames(styles, 'study-lead')}>
            <p class={classNames(styles, 'study-overline')}>The idea</p>
            <h2 class={styles.scope}>{lesson.question}</h2>
            <p class={styles.scope}>{lesson.idea}</p>
          </div>
          <div class={classNames(styles, 'study-anchor')}>
            <StudyMath expression={lesson.anchor} />
            <p class={styles.scope}>{lesson.anchorLabel}</p>
          </div>
          <ol class={classNames(styles, 'study-flow')}>
            {#each lesson.flow as step, index}<li class={styles.scope}>
                <span class={classNames(styles, 'flow-number')}>{index + 1}</span>
                <div class={styles.scope}>
                  <h3 class={styles.scope}>{step.title}</h3>
                  <p class={styles.scope}>{step.body}</p>
                </div>
              </li>{/each}
          </ol>
          <dl class={classNames(styles, 'study-facts')}>
            {#each lesson.facts as fact}<div class={styles.scope}>
                <dt class={styles.scope}>{fact.label}</dt>
                <dd class={styles.scope}>{fact.body}</dd>
              </div>{/each}
          </dl>
          <p class={classNames(styles, 'study-caution')}>
            <strong class={styles.scope}>Watch for this.</strong>
            {lesson.caution}
          </p>
          <a class={classNames(styles, 'study-next')} href={vm.lessonHref(lesson, 'visualize')}>See it happen →</a>
        {:else if view === 'examples'}
          <div class={classNames(styles, 'study-lead')}>
            <p class={classNames(styles, 'study-overline')}>Example {vm.exampleIndex + 1} / {lesson.examples.length}</p>
            <h2 class={styles.scope}>{vm.example.title}</h2>
            <p class={styles.scope}>{vm.example.intro}</p>
          </div>
          <ol class={classNames(styles, 'example-steps')}>
            {#each vm.example.steps as step, index}<li class={styles.scope}>
                <span class={classNames(styles, 'flow-number')}>{index + 1}</span>
                <div class={styles.scope}>
                  <h3 class={styles.scope}>{step.title}</h3>
                  <p class={styles.scope}>{step.body}</p>
                  {#if step.math}<StudyMath
                      expression={step.math}
                    />{/if}{#if vm.example.cancellation && index === 1}<CancellationSum />{/if}
                </div>
              </li>{/each}
          </ol>
          <div class={classNames(styles, 'study-result')}>
            <span class={styles.scope}>Conclusion</span>
            <p class={styles.scope}>{vm.example.result}</p>
            {#if vm.example.resultMath}<StudyMath expression={vm.example.resultMath} />{/if}
          </div>
          <a class={classNames(styles, 'study-next')} href={vm.lessonHref(lesson, 'practice')}>Check your reasoning →</a
          >
        {:else if view === 'practice'}
          <div class={classNames(styles, 'study-lead')}>
            <p class={classNames(styles, 'study-overline')}>Explain it in your own words</p>
            <h2 class={styles.scope}>Can you make the next decision?</h2>
            <p class={styles.scope}>
              Pause before revealing each answer. The explanation matters more than naming a formula.
            </p>
          </div>
          <ol class={classNames(styles, 'study-checks')}>
            {#each lesson.checks as check, index}<li class={styles.scope}>
                <span class={classNames(styles, 'flow-number')}>{index + 1}</span>
                <div class={styles.scope}>
                  <h3 class={styles.scope}>{check.question}</h3>
                  <details class={styles.scope}>
                    <summary class={styles.scope}>Show the reasoning</summary>
                    <p class={styles.scope}>{check.answer}</p>
                  </details>
                </div>
              </li>{/each}
          </ol>
          <p class={classNames(styles, 'study-caution')}>
            <strong class={styles.scope}>If this is still fuzzy:</strong> revisit one example, then explain which step you
            used and why it was allowed.
          </p>
          <a class={classNames(styles, 'study-next')} href={vm.lessonHref(lesson, 'examples')}>Revisit an example →</a>
        {/if}
      </div>
    {/if}
  </div>
  <nav class={classNames(styles, 'study-connections')} aria-label="Related topics">
    <span class={styles.scope}>Use this idea</span>{#each lesson.connections as link}<a
        class={styles.scope}
        href={link.href}>{link.title} →</a
      >{/each}
  </nav>
</section>
