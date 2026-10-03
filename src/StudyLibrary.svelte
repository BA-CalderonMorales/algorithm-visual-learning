<script>
  import { studyDomains, studyLessons, lessonHref } from './study-lessons.js';
  import StudyTabs from './StudyTabs.svelte';
  let { libraryDomain = 'home', view = 'explore', heroVisible = $bindable(true) } = $props();
  let collection = $derived(studyDomains[libraryDomain]);
  const entries = [
    { id:'algorithms', title:'Algorithms', question:'What moves, and why?', href:'#/algorithms/sorting', description:'Compare seven sorting algorithms. Follow their decisions, then read the code.', links:[{ title:'Selection sort', href:'#/algorithms/selection/understand' },{ title:'Shell sort', href:'#/algorithms/shell/play' },{ title:'All sorting algorithms', href:'#/algorithms/sorting' }] },
    { id:'discrete', title:'Discrete mathematics', question:'Why does it work?', href:'#/discrete', description:'Prove a pattern, cancel a sum, or find the work in a recursion tree.', links:[{ title:'Induction', href:'#/discrete/induction' },{ title:'Telescoping', href:'#/discrete/telescoping' },{ title:'Master theorem', href:'#/discrete/master-theorem' }] },
    { id:'complexity', title:'Complexity', question:'How do growth rates compare?', href:'#/complexity', description:'Understand asymptotic bounds first, then analyze algorithm time and memory.', links:[{ title:'Asymptotic bounds', href:'#/complexity/asymptotic' },{ title:'Time', href:'#/complexity/time' },{ title:'Space', href:'#/complexity/space' }] },
  ];
  const resources = [
    { title:'AlgoMaster', href:'https://algomaster.io/learn/dsa/course-introduction', use:'Structured DSA explanations and interview-preparation topics.', access:'Free content + paid Premium', details:'https://algomaster.io/premium' },
    { title:'NeetCode', href:'https://neetcode.io/practice', use:'Practice problems, solution explanations, and coding-interview preparation.', access:'Free practice + paid Pro', details:'https://neetcode.io/pro' },
    { title:'MIT · Introduction to Algorithms', href:'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', use:'Lectures, notes, and practice problems for deeper algorithm analysis.', access:'Free course materials' },
    { title:'MIT · Mathematics for Computer Science', href:'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/', use:'Proofs, induction, sums, recurrences, and an open textbook.', access:'Free course materials' },
  ];
</script>

{#if libraryDomain === 'home'}
  {#if heroVisible}
    <section class="library-heading">
      <p class="library-label">DSA Study Studio</p>
      <h1>A place to work things out.</h1>
      <p>Algorithms, proofs, and complexity. Watch an idea, follow an example, then try explaining it yourself.</p>
      <button class="hero-visibility-toggle" onclick={() => heroVisible = false}>Hide intro <span aria-hidden="true">⌃</span></button>
    </section>
  {:else}
    <div class="hero-collapsed-strip"><span>DSA Study Studio</span><button class="hero-visibility-toggle" onclick={() => heroVisible = true}>Show intro <span aria-hidden="true">⌄</span></button></div>
  {/if}
  <div class="home-workspace">
  <StudyTabs tabs={[{ id:'explore', label:'Explore', href:'#/home' }, { id:'resources', label:'Resources', href:'#/home/resources' }, { id:'author', label:'Author’s note', href:'#/home/author' }]} selected={view} label="Study home views" idPrefix="home-tab" controls="home-panel" />
  <div class="home-panel" role="tabpanel" id="home-panel" aria-labelledby="home-tab-{view}" tabindex="0">
  {#if view === 'explore'}
  <section class="library-rows" aria-label="Learning domains">
    {#each entries as entry, index}
      <article class="library-row">
        <div class="library-copy"><span class="library-label">0{index + 1} / {entry.title}</span><h2><a href={entry.href}>{entry.question} <span>↗</span></a></h2><p>{entry.description}</p></div>
        <div class="library-sketch" aria-hidden="true">
          {#if entry.id === 'algorithms'}
            <svg viewBox="0 0 220 90"><path class="sketch-path" d="M31 24Q110 -12 189 24"/><path class="sketch-path" d="M31 59Q110 104 189 59"/>{#each [2, 4, 7, 9] as value, i}<rect x={12 + i * 53} y="29" width="36" height="34"/><text x={30 + i * 53} y="51">{value}</text>{/each}</svg>
          {:else if entry.id === 'discrete'}
            <svg viewBox="0 0 220 90"><path class="sketch-path" d="M36 44H184"/>{#each ['P(1)', 'P(k)', 'P(k+1)'] as value, i}<circle cx={31 + i * 79} cy="44" r="25"/><text x={31 + i * 79} y="48" font-size="11">{value}</text>{/each}</svg>
          {:else}
            <svg viewBox="0 0 220 90"><path class="sketch-axis" d="M15 12V76H207"/><path class="sketch-path" d="M16 74L201 54"/><path class="sketch-cost" d="M16 74Q148 73 201 17"/><text x="194" y="87" font-size="10">n</text></svg>
          {/if}
        </div>
        <nav class="library-links" aria-label="{entry.title} topics">{#each entry.links as link}<a href={link.href}>{link.title}<span>→</span></a>{/each}</nav>
      </article>
    {/each}
  </section>
  <section class="library-bridge">
    <div><p class="library-label">One idea across subjects</p><h2>Follow merge sort beyond the array.</h2><p>The same algorithm can teach you how data moves, why the time is n log n, and where the extra memory goes.</p></div>
    <nav aria-label="Merge sort learning path"><a href="#/algorithms/merge/play"><span>01</span> Watch the merge</a><span class="path-arrow" aria-hidden="true">→</span><a href="#/discrete/master-theorem/visualize"><span>02</span> Count the levels</a><span class="path-arrow" aria-hidden="true">→</span><a href="#/complexity/space/examples"><span>03</span> Account for the buffer</a></nav>
  </section>
  {:else if view === 'resources'}
    <section class="resource-directory">
      <p class="library-label">Other places to learn</p><h2>Use the explanation that clicks for you.</h2><p class="resource-intro">These complement this guide. Paid access elsewhere is optional; nothing on this site requires buying another service.</p>
      {#each resources as resource}<article class="resource-row"><div><h3><a href={resource.href} target="_blank" rel="noopener noreferrer">{resource.title} ↗</a></h3><p>{resource.use}</p></div><div><span>{resource.access}</span>{#if resource.details}<a href={resource.details} target="_blank" rel="noopener noreferrer">Access details ↗</a>{/if}</div></article>{/each}
      <p class="resource-note">Independent resources; no affiliation. Check each provider for current access options and terms.</p>
    </section>
  {:else if view === 'author'}
    <article class="author-note">
      <p class="library-label">From the author</p><h2>This began with frustration.</h2>
      <p>During my Data Structures and Algorithms class, I wanted a free, open-source place that explained things in a way that felt intuitive to me. I needed to see what moved, which values were being compared, and why the next step was valid—not just memorize a finished array or a time-complexity formula. This site grew out of that need.</p>
      <p>Coding agents can produce implementations quickly. That makes understanding the underlying ideas more important to me, not less. These algorithms are part of the machinery behind the software we use every day. We should be able to ask why they work, what they cost, and when a different approach would be better.</p>
      <p>There is a Chesterton’s-fence lesson here: understand what a structure is doing before tearing it down. I want this guide to help us inspect those fences, question them intelligently, and improve things with a reason—not simply accept generated code because it runs.</p>
      <p>This is meant to outlive one class. Students can fork it for their own study habits; instructors can adapt it for future classes; anyone can help make an explanation clearer. Learning and teaching should not require paying an arm and a leg. The project is MIT-licensed, so you can reuse and adapt it while retaining the license notice.</p>
      <p class="author-signature">— Brandon Calderon-Morales</p>
      <nav aria-label="Help improve this guide"><a href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contribute an improvement ↗</a><a href="https://github.com/BA-CalderonMorales/algorithm-visual-learning" target="_blank" rel="noopener noreferrer">Fork the repository ↗</a><a href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/LICENSE" target="_blank" rel="noopener noreferrer">Read the MIT license ↗</a></nav>
    </article>
  {/if}
  </div>
  </div>
{:else}
  {#if heroVisible}
    <section class="library-heading domain-heading">
      <a class="library-back" href="#/home">← Study home</a>
      <h1>{collection.title}</h1><p>{collection.intro}</p>
      <button class="hero-visibility-toggle" onclick={() => heroVisible = false}>Hide intro <span aria-hidden="true">⌃</span></button>
    </section>
  {:else}
    <div class="hero-collapsed-strip"><span>{collection.title}</span><button class="hero-visibility-toggle" onclick={() => heroVisible = true}>Show intro <span aria-hidden="true">⌄</span></button></div>
  {/if}
  <section class="topic-directory" aria-label="{collection.title} topics">
    {#each collection.topics as id, index}
      {@const lesson = studyLessons[id]}
      <article class="topic-row"><span class="topic-number">0{index + 1}</span><div><h2><a href={lessonHref(lesson)}>{lesson.title}</a></h2><p>{lesson.question}</p><small>{lesson.intro}</small></div><nav aria-label="{lesson.title} entry points"><a href={lessonHref(lesson)}>Understand →</a><a href={lessonHref(lesson, 'visualize')}>Visualize →</a></nav></article>
    {/each}
  </section>
  <section class="library-bridge"><div><p class="library-label">Connect it</p><p>{collection.bridge}</p></div><nav aria-label="Related domains">{#each collection.links as link}<a href={link.href}>{link.title} →</a>{/each}</nav></section>
{/if}

<style>
  .library-heading { padding:12px 0 32px; }
  .library-label { margin:0 0 10px; color:#8f9dac; font-size:11px; letter-spacing:.04em; }
  .library-heading h1 { max-width:100%; font-size:clamp(32px,3.5vw,48px); letter-spacing:-.035em; line-height:1.15; }
  .library-heading > p:last-child { max-width:720px; margin:17px 0 0; color:#b1bbc9; font-size:16px; line-height:1.7; }
  a { color:inherit; text-decoration:none; }
  a:hover { color:#a1ccff; }
  a:focus-visible { outline:2px solid #79b7ff; outline-offset:4px; }
  .library-rows { border-top:1px solid #3b414b; }
  .library-row { display:grid; grid-template-columns:minmax(230px,1.4fr) 220px minmax(180px,.7fr); gap:30px; align-items:center; padding:26px 0; border-bottom:1px solid #3b414b; }
  .library-copy h2 { font-size:24px; margin:0 0 11px; }
  .library-copy h2 span { color:#648dac; font-size:19px; }
  .library-copy p { max-width:490px; margin:0; font-size:13px; line-height:1.7; color:#a9b7c8; }
  .library-sketch svg { display:block; width:220px; }
  .library-sketch rect,.library-sketch circle { fill:#1c232b; stroke:#627c8a; stroke-width:1; }
  .library-sketch text { fill:#c6dae4; text-anchor:middle; font:14px Cambria,serif; }
  .sketch-path { fill:none; stroke:#65d9b0; stroke-width:1.5; }
  .sketch-axis { fill:none; stroke:#42515f; stroke-width:1; }
  .sketch-cost { fill:none; stroke:#c2a0fb; stroke-width:1.5; }
  .library-links { display:grid; gap:5px; }
  .library-links a { display:flex; justify-content:space-between; gap:20px; padding:8px 0; color:#b1c4d9; font-size:12px; }
  .library-links a span { color:#6a829b; }
  .library-bridge { margin-top:28px; padding:22px 0 6px; }
  .library-bridge h2 { font-size:19px; margin-bottom:10px; }
  .library-bridge p:not(.library-label) { max-width:770px; margin:0; color:#a9b7c8; font-size:13px; line-height:1.7; }
  .library-bridge nav { display:flex; flex-wrap:wrap; align-items:center; gap:14px; margin-top:20px; }
  .library-bridge nav a { padding:10px 0; color:#b5d5ed; font-size:12px; }
  .library-bridge nav a span { color:#718aa2; margin-right:7px; font-size:10px; }
  .home-workspace { border:1px solid #3a3d47; background:#1b1d23; }
  .home-panel { height:clamp(450px,68svh,780px); overflow:auto; padding:6px 27px 25px; scrollbar-width:thin; scrollbar-color:#596579 #1b1d23; }
  .home-panel .library-rows { border-top:0; }
  .home-panel .library-row { grid-template-columns:minmax(230px,1.4fr) 160px minmax(170px,.7fr); gap:22px; }
  .home-panel .library-sketch svg { width:160px; }
  .resource-directory,.author-note { padding:25px 3px; }
  .resource-directory h2,.author-note h2 { font-size:25px; margin-bottom:16px; }
  .resource-intro,.author-note > p:not(.library-label) { max-width:800px; color:#b6c1cf; font-size:14px; line-height:1.85; margin:0 0 20px; }
  .resource-row { display:grid; grid-template-columns:minmax(0,1fr) 205px; gap:25px; padding:20px 0; border-top:1px solid #3b414b; }
  .resource-row h3 { font-size:17px; }
  .resource-row p { color:#a9b7c8; font-size:13px; line-height:1.7; margin:9px 0 0; }
  .resource-row > div:last-child { display:grid; gap:10px; align-content:center; color:#a5b5c8; font-size:11px; }
  .resource-row > div:last-child a { color:#9ac8ff; }
  .resource-note { color:#8797a9; font-size:11px; line-height:1.6; margin:12px 0 0; }
  .author-note nav { display:flex; flex-wrap:wrap; gap:12px 24px; border-top:1px solid #3b414b; padding-top:20px; color:#9ac8ff; font-size:12px; }
  .author-note .author-signature { color:#d1dbe8; font-size:13px; }
  .path-arrow { color:#586e7d; font-size:12px; }
  .library-back { display:inline-block; color:#9ac8ff; font-size:12px; margin-bottom:18px; }
  .topic-directory { border-top:1px solid #3b414b; }
  .topic-row { display:grid; grid-template-columns:35px minmax(0,1fr) 135px; gap:20px; align-items:center; padding:27px 0; border-bottom:1px solid #3b414b; }
  .topic-number { align-self:start; padding-top:6px; color:#8e7eab; font-size:12px; }
  .topic-row h2 { font-size:23px; }
  .topic-row p { color:#c1ccda; font-size:14px; margin:10px 0; }
  .topic-row small { color:#96a7bd; font-size:12px; line-height:1.7; }
  .topic-row nav { display:grid; gap:14px; color:#9ac8ff; font-size:12px; }
  @media(max-width:1000px) { .home-panel .library-row,.library-row { grid-template-columns:minmax(0,1fr) 180px; gap:12px 26px; } .library-sketch { grid-column:2; grid-row:auto / span 2; } .library-sketch svg { width:180px; } .library-links { grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; } .library-links a { justify-content:flex-start; gap:6px; } }
  @media(max-width:600px) {
    .library-heading { padding:8px 0 25px; } .library-heading > p:last-child { font-size:14px; }
    .home-panel .library-row,.library-row { grid-template-columns:1fr; gap:12px; padding:23px 0; }
    .library-sketch { display:none; } .library-links { display:flex; flex-wrap:wrap; gap:4px 20px; }
    .library-copy h2 { font-size:22px; }
    .topic-row { grid-template-columns:24px minmax(0,1fr); gap:12px; }
    .topic-row nav { grid-column:2; display:flex; gap:23px; margin-top:6px; }
    .topic-row h2 { font-size:21px; }
    .library-bridge nav { align-items:flex-start; gap:5px; flex-direction:column; }
    .path-arrow { display:none; }
    .home-panel { padding:4px 17px 20px; height:clamp(460px,72svh,680px); }
    .resource-row { grid-template-columns:1fr; gap:12px; }
    .resource-row > div:last-child { display:flex; flex-wrap:wrap; gap:15px; }
  }
</style>
