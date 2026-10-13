<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import ConceptFilm from '../../playback/player/view.svelte';
  import StudyMath from '../math/view.svelte';
  import CancellationSum from '../../../discrete/telescoping/components/cancellation/view.svelte';
  import TabWorkspace from '../tab-workspace/view.svelte';
  import AsymptoticRatio from '../../../complexity/asymptotic/components/ratio/view.svelte';
  import NavigationLink from '../navigation-link/view.svelte';
  import ReasoningDisclosure from '../reasoning-disclosure/view.svelte';
  import InsertionWorkbench from '../../../structures/components/insertion/view.svelte';
  import ReasoningPractice from '../reasoning-practice/view.svelte';
  import AnimationDisclosure from '../animation-disclosure/view.svelte';
  import CodeWorkbench from '../code-workbench/view.svelte';
  let { lesson, view = 'understand', film, variants = [], legend = [], lab } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ lesson, view }));
</script>

<section class={classNames(styles, 'study-workspace')} aria-label="{lesson.title} lesson">
  <TabWorkspace
    tabs={vm.lessonTabs.map((tab) => ({ ...tab, href: vm.lessonHref(lesson, tab.id) }))}
    selected={view}
    label="{lesson.title} views"
    controls="study-panel"
    idPrefix="study-tab"
  >
    <div
      class={classNames(styles, 'study-panel')}
      role="tabpanel"
      id="study-panel"
      aria-labelledby="study-tab-{view}"
      tabindex="0"
    >
      {#if view === 'visualize'}
        <div class={classNames(styles, 'study-visual-scroll')}>
          {#if lab}<CodeWorkbench definition={lab} />
            <AnimationDisclosure label="Explore the concept animation"
              >{#if lesson.id === 'list-insertion' || lesson.id === 'list-storage'}<InsertionWorkbench
                />{:else}<ConceptFilm {film} {variants} {legend} embedded lessonPlayer />{/if}
            </AnimationDisclosure>{:else if lesson.id === 'list-insertion' || lesson.id === 'list-storage'}<InsertionWorkbench
            />{:else if lesson.id === 'asymptotic'}<AsymptoticRatio
              comparisons={lesson.comparisons}
            />{:else}<ConceptFilm {film} {variants} {legend} embedded lessonPlayer />{/if}
        </div>
      {:else}
        {#if view === 'examples'}
          <nav class={classNames(styles, 'example-picker')} aria-label="Worked examples">
            {#each lesson.examples as item, index}<button
                class={classNames(styles, '', { active: vm.exampleIndex === index })}
                aria-pressed={vm.exampleIndex === index}
                onclick={() => vm.chooseExample(index)}
                ><span class={styles.scope}>{index + 1}</span>{item.title}</button
              >{/each}
          </nav>
        {/if}
        <div class={classNames(styles, 'study-scroll')} bind:this={vm.scroller}>
          {#if view === 'understand'}
            <div class={classNames(styles, 'study-lead')}>
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
            <div class={classNames(styles, 'study-next')}>
              <NavigationLink href={vm.lessonHref(lesson, 'visualize')} label="See it happen" />
            </div>
          {:else if view === 'examples'}
            <div class={classNames(styles, 'study-lead')}>
              <p class={classNames(styles, 'study-overline')}>
                Example {vm.exampleIndex + 1} / {lesson.examples.length}
              </p>
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
            <div class={classNames(styles, 'study-next')}>
              <NavigationLink href={vm.lessonHref(lesson, 'practice')} label="Check your reasoning" />
            </div>
          {:else if view === 'practice'}
            <ReasoningPractice topic={lesson.id} />
            <h2 class={styles.scope}>Explain your reasoning</h2>
            <ol class={classNames(styles, 'study-checks')}>
              {#each lesson.checks as check, index}<li class={styles.scope}>
                  <span class={classNames(styles, 'flow-number')}>{index + 1}</span>
                  <div class={styles.scope}>
                    <h3 class={styles.scope}>{check.question}</h3>
                    <ReasoningDisclosure answer={check.answer} />
                  </div>
                </li>{/each}
            </ol>
            <div class={classNames(styles, 'study-next')}>
              <NavigationLink href={vm.lessonHref(lesson, 'examples')} label="Revisit an example" />
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </TabWorkspace>
  <nav class={classNames(styles, 'study-connections')} aria-label="Related topics">
    {#each lesson.connections as link}<NavigationLink href={link.href} label={link.title} />{/each}
  </nav>
</section>
