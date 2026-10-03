<script>
  import { tick } from 'svelte';
  import ConceptFilm from './ConceptFilm.svelte';
  import StudyMath from './StudyMath.svelte';
  import CancellationSum from './CancellationSum.svelte';
  import StudyTabs from './StudyTabs.svelte';
  import AsymptoticRatio from './AsymptoticRatio.svelte';
  import { playFilms } from './play-models.js';
  import { lessonTabs, lessonHref } from './study-lessons.js';
  let { lesson, view = 'understand' } = $props();
  let exampleIndex = $state(0);
  let scroller = $state(null);
  let example = $derived(lesson.examples[exampleIndex]);
  $effect(() => { view; tick().then(() => { if (scroller) scroller.scrollTop = 0; }); });
  async function chooseExample(index) {
    exampleIndex = index;
    await tick();
    scroller.scrollTop = 0;
  }
</script>

<section class="study-workspace" aria-label="{lesson.title} lesson">
  <StudyTabs tabs={lessonTabs.map(tab => ({ ...tab, href: lessonHref(lesson, tab.id) }))} selected={view} label="{lesson.title} views" controls="study-panel" idPrefix="study-tab" />
  <div class="study-panel" role="tabpanel" id="study-panel" aria-labelledby="study-tab-{view}" tabindex="0">
    {#if view === 'visualize'}
      <div class="study-visual-scroll">
        {#if lesson.id === 'asymptotic'}<AsymptoticRatio comparisons={lesson.comparisons} />{:else}<ConceptFilm film={playFilms[lesson.id]} embedded lessonPlayer />{/if}
      </div>
    {:else}
      {#if view === 'examples'}
        <nav class="example-picker" aria-label="Worked examples">{#each lesson.examples as item, index}<button class:active={exampleIndex === index} aria-pressed={exampleIndex === index} onclick={() => chooseExample(index)}><span>{index + 1}</span>{item.title}</button>{/each}</nav>
      {/if}
      <div class="study-scroll" bind:this={scroller}>
        {#if view === 'understand'}
          <div class="study-lead"><p class="study-overline">The idea</p><h2>{lesson.question}</h2><p>{lesson.idea}</p></div>
          <div class="study-anchor"><StudyMath expression={lesson.anchor} /><p>{lesson.anchorLabel}</p></div>
          <ol class="study-flow">{#each lesson.flow as step, index}<li><span class="flow-number">{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>{/each}</ol>
          <dl class="study-facts">{#each lesson.facts as fact}<div><dt>{fact.label}</dt><dd>{fact.body}</dd></div>{/each}</dl>
          <p class="study-caution"><strong>Watch for this.</strong> {lesson.caution}</p>
          <a class="study-next" href={lessonHref(lesson, 'visualize')}>See it happen →</a>
        {:else if view === 'examples'}
          <div class="study-lead"><p class="study-overline">Example {exampleIndex + 1} / {lesson.examples.length}</p><h2>{example.title}</h2><p>{example.intro}</p></div>
          <ol class="example-steps">{#each example.steps as step, index}<li><span class="flow-number">{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p>{#if step.math}<StudyMath expression={step.math} />{/if}{#if example.cancellation && index === 1}<CancellationSum />{/if}</div></li>{/each}</ol>
          <div class="study-result"><span>Conclusion</span><p>{example.result}</p>{#if example.resultMath}<StudyMath expression={example.resultMath} />{/if}</div>
          <a class="study-next" href={lessonHref(lesson, 'practice')}>Check your reasoning →</a>
        {:else if view === 'practice'}
          <div class="study-lead"><p class="study-overline">Explain it in your own words</p><h2>Can you make the next decision?</h2><p>Pause before revealing each answer. The explanation matters more than naming a formula.</p></div>
          <ol class="study-checks">{#each lesson.checks as check, index}<li><span class="flow-number">{index + 1}</span><div><h3>{check.question}</h3><details><summary>Show the reasoning</summary><p>{check.answer}</p></details></div></li>{/each}</ol>
          <p class="study-caution"><strong>If this is still fuzzy:</strong> revisit one example, then explain which step you used and why it was allowed.</p>
          <a class="study-next" href={lessonHref(lesson, 'examples')}>Revisit an example →</a>
        {/if}
      </div>
    {/if}
  </div>
  <nav class="study-connections" aria-label="Related topics"><span>Use this idea</span>{#each lesson.connections as link}<a href={link.href}>{link.title} →</a>{/each}</nav>
</section>

<style>
  .study-workspace { min-width:0; border:1px solid #3a3d47; background:#1b1d23; }
  .study-next:focus-visible,.study-connections a:focus-visible { outline:2px solid #79b7ff; outline-offset:-3px; }
  .study-panel { display:flex; flex-direction:column; height:clamp(450px,68svh,780px); min-width:0; overflow:hidden; padding:clamp(12px,1.5vw,18px); }
  .study-scroll,.study-visual-scroll { overflow-y:auto; overflow-x:hidden; min-height:0; scrollbar-width:thin; scrollbar-color:#596579 #1b1d23; overscroll-behavior:contain; }
  .study-scroll { padding:clamp(12px,2vw,24px); }
  .study-visual-scroll :global(.concept-film.embedded) { margin:0; border:0; }
  .study-lead { max-width:760px; }
  .study-overline { margin:0 0 8px; color:#8598ad; font-size:11px; }
  .study-lead h2 { margin:0 0 10px; font-size:clamp(20px,2.1vw,26px); }
  .study-lead > p:last-child { margin:0; color:#b7c2d0; font-size:14px; line-height:1.7; }
  .study-anchor { margin:22px 0; padding:6px 16px 14px; border-block:1px solid #363d49; background:#181c24; }
  .study-anchor > p { margin:0; text-align:center; color:#94a1b3; font-size:11px; line-height:1.5; }
  .study-flow { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; padding:0; margin:25px 0; list-style:none; }
  .study-flow li { display:flex; gap:12px; min-width:0; }
  .flow-number { flex:none; min-width:25px; color:#bda4f5; font-size:12px; font-variant-numeric:tabular-nums; padding-top:3px; }
  h3 { margin:0 0 7px; font-size:14px; line-height:1.5; color:#e0e7f1; }
  li p,dd { margin:0; color:#aebdce; font-size:13px; line-height:1.75; }
  .study-facts { display:grid; gap:0; margin:22px 0; }
  .study-facts > div { display:grid; grid-template-columns:minmax(130px,1fr) 3fr; gap:22px; padding:15px 0; border-top:1px solid #343d48; }
  dt { font-size:12px; line-height:1.6; color:#d2ddeb; }
  .study-caution { margin:20px 0; border-left:2px solid #dba778; padding:0 0 0 14px; color:#acb8c8; font-size:12px; line-height:1.75; }
  .study-caution strong { color:#dfc8af; }
  .study-next { display:inline-block; color:#9ac8ff; text-decoration:none; font-size:13px; margin:6px 0; }
  .study-next:hover { text-decoration:underline; }
  .example-picker { display:flex; flex-wrap:wrap; gap:5px; padding:12px 18px; border-bottom:1px solid #3a3d47; background:#191d24; }
  .example-picker button { display:flex; align-items:center; gap:8px; padding:8px 10px; min-height:36px; background:transparent; border:1px solid #394554; border-radius:0; color:#a7b6c8; font:inherit; font-size:12px; cursor:pointer; }
  .example-picker button.active { border-color:#9f87c8; color:#decbff; background:#282536; }
  .example-picker button span { color:#8d789f; font-size:10px; }
  .example-steps,.study-checks { padding:0; margin:24px 0; list-style:none; display:grid; gap:20px; }
  .example-steps li,.study-checks li { display:grid; grid-template-columns:25px minmax(0,1fr); gap:14px; padding-bottom:20px; border-bottom:1px solid #343d48; }
  .example-steps li:last-child { border-bottom:0; }
  .study-result { padding:18px 20px; border-left:2px solid #65d9b0; background:#1c2826; }
  .study-result > span { color:#65d9b0; font-size:11px; }
  .study-result p { margin:8px 0 0; color:#c7ddd4; font-size:13px; line-height:1.7; }
  details { margin-top:12px; color:#b9c8db; font-size:13px; }
  summary { cursor:pointer; color:#99c5ff; padding:6px 0; }
  details p { padding:10px 0; }
  .study-connections { display:flex; flex-wrap:wrap; gap:8px 24px; padding:15px 25px; border-top:1px solid #3a3d47; font-size:12px; }
  .study-connections span { color:#8595a8; }
  .study-connections a { color:#9ac8ff; text-decoration:none; }
  @media(max-width:720px) {
    .study-panel { height:clamp(460px,72svh,680px); }
    .study-flow { grid-template-columns:1fr; gap:20px; }
    .study-facts > div { grid-template-columns:1fr; gap:6px; }
    .study-panel { padding:12px; }
    .study-scroll { padding:15px 13px; }
    .study-connections { padding:14px 18px; font-size:11px; }
    .example-picker { padding:10px; }
    .example-picker button { font-size:11px; }
  }
</style>
