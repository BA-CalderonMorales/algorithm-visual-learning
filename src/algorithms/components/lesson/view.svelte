<script>
  import IntroToggle from '../../../shared/ui/intro-toggle/view.svelte';
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  import StudyTabs from '../../../shared/ui/tabs/view.svelte';
  import WalkthroughFrame from '../walkthrough/view.svelte';
  import GrowthChart from '../growth/view.svelte';
  import Implementation from '../implementation/view.svelte';
  import ConceptFilm from '../../../shared/playback/player/view.svelte';
  import { renderSelection } from '../../selection/components/play/renderer.ts';
  import { describeScene } from '../../selection/components/play/model.ts';
  let { vm } = $props();
</script>

{#if vm.heroVisible}
  <section class={classNames(styles, 'page-hero compact-hero algorithm-hero')}>
    <a class={classNames(styles, 'back-link')} href="#/algorithms/sorting">← All sorting algorithms</a>
    <p class={classNames(styles, 'eyebrow')}>Algorithm walkthrough · code references</p>
    <h1 class={styles.scope}>{vm.selectedAlgorithm.name}</h1>
    {#if vm.selectedAlgorithm.id === 'quick'}
      <p class={classNames(styles, 'intro')}>
        Follow the partition, then decide whether each side recurses or uses insertion sort.
      </p>
    {:else}
      <p class={classNames(styles, 'intro')}>
        {vm.selectedAlgorithm.cue} Start with the simple version, then compare typed Python, JavaScript, and TypeScript.
      </p>
    {/if}
    <IntroToggle bind:visible={vm.heroVisible} />
  </section>
{:else}
  <div class={classNames(styles, 'hero-collapsed-strip')}>
    <span class={styles.scope}>{vm.selectedAlgorithm.name}</span><IntroToggle bind:visible={vm.heroVisible} />
  </div>
{/if}
<section
  class={classNames(styles, 'algorithm-view standalone-view', { 'play-view': vm.algorithmView === 'play' })}
  aria-label="{vm.selectedAlgorithm.name} materials"
>
  <StudyTabs
    tabs={[
      ['understand', 'Understand'],
      ['play', 'Play'],
      ['walkthrough', 'Step-by-step'],
      ['implementation', 'Implementations'],
      ['practice', 'Practice'],
      ['complexity', 'Complexity'],
      ['growth', 'Growth'],
    ].map(([id, label]) => ({
      id,
      label,
      href: `#/algorithms/${vm.selectedAlgorithm.id}/${id === 'implementation' ? 'python/simple' : id}`,
    }))}
    selected={vm.algorithmView}
    label="{vm.selectedAlgorithm.name} learning materials"
    idPrefix="algorithm-tab"
  />
  {#if vm.algorithmView === 'walkthrough'}
    {#key vm.selectedAlgorithm.id}
      <WalkthroughFrame
        name={vm.selectedAlgorithm.name}
        src={vm.walkthroughUrl(vm.selectedAlgorithm)}
        onShortcut={vm.handleFrameShortcut}
      />
    {/key}
  {/if}
  {#if vm.algorithmView === 'play'}
    {#key vm.selectedAlgorithm.id}
      <ConceptFilm
        film={vm.playFilms[vm.selectedAlgorithm.id]}
        legend={vm.conceptLegends[vm.selectedAlgorithm.id]}
        narration={vm.voiceForFilm(vm.playFilms[vm.selectedAlgorithm.id])}
        renderer={vm.selectedAlgorithm.id === 'selection' ? renderSelection : undefined}
        sceneDescription={vm.selectedAlgorithm.id === 'selection' ? describeScene : undefined}
        sorting
      />
    {/key}
  {:else if vm.algorithmView === 'understand'}
    <section class={classNames(styles, 'learning-view understand-view')} aria-labelledby="understand-title">
      <header class={classNames(styles, 'understand-intro')}>
        <div class={classNames(styles, 'understand-heading')}>
          <p class={classNames(styles, 'eyebrow')}>The core idea</p>
          <h2 class={styles.scope} id="understand-title">What {vm.selectedAlgorithm.name} is doing</h2>
        </div>
        <p class={classNames(styles, 'learning-lead')}>{vm.selectedLesson.idea}</p>
      </header>
      <div class={classNames(styles, 'understand-grid')} aria-label="How to reason through {vm.selectedAlgorithm.name}">
        <article class={classNames(styles, 'understand-point invariant-point')}>
          <span class={classNames(styles, 'understand-index')}>01</span>
          <div class={styles.scope}>
            <span class={classNames(styles, 'learning-label')}>What stays true</span>
            <p class={styles.scope}>{vm.selectedLesson.invariant}</p>
          </div>
        </article>
        <article class={classNames(styles, 'understand-point')}>
          <span class={classNames(styles, 'understand-index')}>02</span>
          <div class={styles.scope}>
            <span class={classNames(styles, 'learning-label')}>What to watch</span>
            <p class={styles.scope}>{vm.selectedLesson.watch}</p>
          </div>
        </article>
        <article class={classNames(styles, 'understand-point example-point')}>
          <span class={classNames(styles, 'understand-index')}>03</span>
          <div class={styles.scope}>
            <span class={classNames(styles, 'learning-label')}>A small example</span>
            <p class={styles.scope}>{vm.selectedLesson.example}</p>
          </div>
        </article>
      </div>
      {#if vm.selectedAlgorithm.id === 'quick'}
        <article class={classNames(styles, 'worked-example reasoning-card')}>
          <div class={classNames(styles, 'example-head')}>
            <span class={styles.scope}>Read a partition like an exam trace</span><span
              class={classNames(styles, 'example-tag')}>Pivot = 4</span
            >
          </div>
          <p class={classNames(styles, 'reasoning-intro')}>
            Use Worksheet A: <code class={styles.scope}>[4, 7, 8, 2, 9, 5, 6, 3, 1]</code>. The sample values are 4, 9,
            and 1, so the median is 4. Order those samples, then move the median to high − 1:
          </p>
          <div class={classNames(styles, 'trace-state')}>
            <span class={styles.scope}>Before scans</span><code class={styles.scope}
              >[1, 7, 8, 2, 3, 5, 6, <b class={styles.scope}>4</b>, 9]</code
            ><small class={styles.scope}
              >Pivot 4 is at index 7. The minimum 1 and maximum 9 are sentinels at the ends.</small
            >
          </div>
          <ol class={classNames(styles, 'reasoning-steps')}>
            <li class={styles.scope}>
              <b class={styles.scope}>Scan I from the left.</b><span class={styles.scope}
                >I starts after the left sentinel. It stops at 7 because 7 is not below pivot 4.</span
              >
            </li>
            <li class={styles.scope}>
              <b class={styles.scope}>Scan J from the right.</b><span class={styles.scope}
                >J passes 6 and 5 because they are above 4. It stops at 3 because 3 is not above the pivot.</span
              >
            </li>
            <li class={styles.scope}>
              <b class={styles.scope}>Swap the stopped values.</b><span class={styles.scope}
                >7 and 3 trade places; I and J stay at their indices. Next, I stops at 8 and J stops at 2, so those
                values trade places.</span
              >
            </li>
            <li class={styles.scope}>
              <b class={styles.scope}>Finish when the pointers cross.</b><span class={styles.scope}
                >The scan boundary is index 3. Swap the pivot with the value at I (8), placing 4 in its final position.</span
              >
            </li>
          </ol>
          <div class={classNames(styles, 'trace-result')}>
            <span class={styles.scope}>Partition checkpoint</span><code class={styles.scope}
              >[1, 3, 2] &nbsp;|&nbsp; <b class={styles.scope}>4</b> &nbsp;|&nbsp; [7, 5, 6, 8, 9]</code
            ><small class={styles.scope}
              >S1 contains values ≤ 4, S2 contains values ≥ 4, and the pivot is now fixed. Sort each side independently.</small
            >
          </div>
          <p class={classNames(styles, 'caution')}>
            <strong class={styles.scope}>Pointer reminder:</strong> a swap moves array values, not I or J. The final pivot
            swap happens only after I and J cross.
          </p>
        </article>
      {/if}
      <a class={classNames(styles, 'primary learning-link')} href="#/algorithms/{vm.selectedAlgorithm.id}/walkthrough"
        >Now follow a step-by-step trace →</a
      >
    </section>
  {:else if vm.algorithmView === 'practice'}
    <section class={classNames(styles, 'learning-view practice-view')} aria-labelledby="practice-title">
      <p class={classNames(styles, 'eyebrow')}>Retrieve it from memory</p>
      <h2 class={styles.scope} id="practice-title">Predict before you reveal</h2>
      {#if vm.selectedLesson.practiceChecks}
        <p class={classNames(styles, 'practice-intro')}>
          Work through the same four decisions you make in the algorithm: choose, scan, swap, then split.
        </p>
        <div class={classNames(styles, 'practice-check-grid')}>
          {#each vm.selectedLesson.practiceChecks as check}
            <article class={classNames(styles, 'practice-check-card')}>
              <h3 class={styles.scope}>{check.title}</h3>
              <p class={classNames(styles, 'practice-prompt')}>{check.prompt}</p>
              <details class={classNames(styles, 'answer-reveal')}>
                <summary class={styles.scope}>Reveal the reasoning</summary>
                <p class={styles.scope}>{check.answer}</p>
              </details>
            </article>
          {/each}
        </div>
      {:else}
        <p class={classNames(styles, 'practice-prompt')}>{vm.selectedLesson.practice}</p>
        <details class={classNames(styles, 'answer-reveal')}>
          <summary class={styles.scope}>Show the reasoning</summary>
          <p class={styles.scope}>{vm.selectedLesson.answer}</p>
        </details>
      {/if}
      <a class={classNames(styles, 'secondary learning-link')} href="#/algorithms/{vm.selectedAlgorithm.id}/walkthrough"
        >Return to the walkthrough →</a
      >
    </section>
  {:else if vm.algorithmView === 'complexity'}
    <section class={classNames(styles, 'learning-view complexity-view')} aria-labelledby="algorithm-complexity-title">
      <p class={classNames(styles, 'eyebrow')}>Connect the work to the bound</p>
      <h2 class={styles.scope} id="algorithm-complexity-title">Time and space</h2>
      {#if vm.selectedAlgorithm.id === 'shell'}
        <label class={classNames(styles, 'growth-select')}
          >Gap sequence
          <select class={styles.scope} bind:value={vm.shellGapSequence} aria-label="Shell Sort gap sequence">
            <option class={styles.scope} value="halving">Halving: n/2, n/4, …, 1</option>
            <option class={styles.scope} value="knuth">Knuth: 1, 4, 13, …</option>
          </select>
        </label>
      {/if}
      <div class={classNames(styles, 'case-grid algorithm-case-grid')}>
        {#each Object.entries(vm.selectedGrowthModel.cases) as [key, definition]}
          <article class={styles.scope}>
            <span class={classNames(styles, 'case-label')}
              >{key === 'best' ? 'Best case' : key === 'average' ? 'Average case' : 'Worst case'}</span
            >
            <p class={styles.scope}><strong class={styles.scope}>{definition.bound}</strong></p>
            <p class={styles.scope}>{definition.assumption}</p>
          </article>
        {/each}
      </div>
      <div class={classNames(styles, 'complexity-facts')} aria-label="Algorithmic bounds and approach">
        <article class={classNames(styles, 'learning-card')}>
          <span class={classNames(styles, 'learning-label')}>Divide and conquer</span>
          <p class={styles.scope}>{vm.selectedAlgorithm.divide}</p>
        </article>
        <article class={classNames(styles, 'learning-card')}>
          <span class={classNames(styles, 'learning-label')}>Runtime lower bound</span>
          <p class={styles.scope}>
            {vm.selectedAlgorithm.id === 'shell' && vm.shellGapSequence === 'knuth'
              ? 'Ω(n log n), sorted input with Knuth gaps'
              : vm.selectedAlgorithm.lower}
          </p>
        </article>
        <article class={classNames(styles, 'learning-card')}>
          <span class={classNames(styles, 'learning-label')}>Runtime upper bound</span>
          <p class={styles.scope}>
            {vm.selectedAlgorithm.id === 'shell' && vm.shellGapSequence === 'knuth'
              ? 'O(n^1.5), Knuth gaps'
              : vm.selectedAlgorithm.upper}
          </p>
        </article>
      </div>
      <article class={classNames(styles, 'learning-card space-card')}>
        <span class={classNames(styles, 'learning-label')}>Auxiliary space</span>
        <p class={styles.scope}>{vm.selectedLesson.space}</p>
      </article>
      <p class={classNames(styles, 'complexity-note')}>{vm.selectedLesson.note}</p>
      <p class={classNames(styles, 'complexity-note')}>{vm.selectedGrowthModel.note}</p>
      <a class={classNames(styles, 'secondary learning-link')} href="#/algorithms/{vm.selectedAlgorithm.id}/growth"
        >See these same cases on the Growth chart →</a
      >
      {#if vm.selectedAlgorithm.id === 'quick'}<p class={classNames(styles, 'complexity-note')}>
          {vm.selectedAlgorithm.extra}
        </p>{/if}
    </section>
  {:else if vm.algorithmView === 'growth'}
    <GrowthChart
      algorithmId={vm.selectedAlgorithm.id}
      algorithmName={vm.selectedAlgorithm.name}
      bind:gapSequence={vm.shellGapSequence}
    />
  {:else if vm.algorithmView === 'implementation'}
    <Implementation algorithm={vm.selectedAlgorithm} language={vm.implementationLanguage} />
  {/if}
</section>
