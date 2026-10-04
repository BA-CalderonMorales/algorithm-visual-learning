<script>
  import styles from './view.module.css';
  import { classNames } from '../shared/ui/class-names.ts';
  import StudyTabs from '../shared/ui/tabs/view.svelte';
  let { libraryDomain = 'home', view = 'explore', heroVisible = $bindable(true) } = $props();
  import { entries, resources } from './model.ts';
</script>

{#if libraryDomain === 'home'}
  {#if heroVisible}
    <section class={classNames(styles, 'library-heading')}>
      <p class={classNames(styles, 'library-label')}>DSA Study Studio</p>
      <h1 class={styles.scope}>A place to work things out.</h1>
      <p class={styles.scope}>
        Algorithms, proofs, and complexity. Watch an idea, follow an example, then try explaining it yourself.
      </p>
      <button class={classNames(styles, 'hero-visibility-toggle')} onclick={() => (heroVisible = false)}
        >Hide intro <span class={styles.scope} aria-hidden="true">⌃</span></button
      >
    </section>
  {:else}
    <div class={classNames(styles, 'hero-collapsed-strip')}>
      <span class={styles.scope}>DSA Study Studio</span><button
        class={classNames(styles, 'hero-visibility-toggle')}
        onclick={() => (heroVisible = true)}>Show intro <span class={styles.scope} aria-hidden="true">⌄</span></button
      >
    </div>
  {/if}
  <div class={classNames(styles, 'home-workspace')}>
    <StudyTabs
      tabs={[
        { id: 'explore', label: 'Explore', href: '#/home' },
        { id: 'resources', label: 'Resources', href: '#/home/resources' },
        { id: 'author', label: 'Author’s note', href: '#/home/author' },
      ]}
      selected={view}
      label="Study home views"
      idPrefix="home-tab"
      controls="home-panel"
    />
    <div
      class={classNames(styles, 'home-panel')}
      role="tabpanel"
      id="home-panel"
      aria-labelledby="home-tab-{view}"
      tabindex="0"
    >
      {#if view === 'explore'}
        <section class={classNames(styles, 'library-rows')} aria-label="Learning domains">
          {#each entries as entry, index}
            <article class={classNames(styles, 'library-row')}>
              <div class={classNames(styles, 'library-copy')}>
                <span class={classNames(styles, 'library-label')}>0{index + 1} / {entry.title}</span>
                <h2 class={styles.scope}>
                  <a class={styles.scope} href={entry.href}>{entry.question} <span class={styles.scope}>↗</span></a>
                </h2>
                <p class={styles.scope}>{entry.description}</p>
              </div>
              <div class={classNames(styles, 'library-sketch')} aria-hidden="true">
                {#if entry.id === 'algorithms'}
                  <svg class={styles.scope} viewBox="0 0 220 90"
                    ><path class={classNames(styles, 'sketch-path')} d="M31 24Q110 -12 189 24" /><path
                      class={classNames(styles, 'sketch-path')}
                      d="M31 59Q110 104 189 59"
                    />{#each [2, 4, 7, 9] as value, i}<rect
                        class={styles.scope}
                        x={12 + i * 53}
                        y="29"
                        width="36"
                        height="34"
                      /><text class={styles.scope} x={30 + i * 53} y="51">{value}</text>{/each}</svg
                  >
                {:else if entry.id === 'discrete'}
                  <svg class={styles.scope} viewBox="0 0 220 90"
                    ><path
                      class={classNames(styles, 'sketch-path')}
                      d="M36 44H184"
                    />{#each ['P(1)', 'P(k)', 'P(k+1)'] as value, i}<circle
                        class={styles.scope}
                        cx={31 + i * 79}
                        cy="44"
                        r="25"
                      /><text class={styles.scope} x={31 + i * 79} y="48" font-size="11">{value}</text>{/each}</svg
                  >
                {:else}
                  <svg class={styles.scope} viewBox="0 0 220 90"
                    ><path class={classNames(styles, 'sketch-axis')} d="M15 12V76H207" /><path
                      class={classNames(styles, 'sketch-path')}
                      d="M16 74L201 54"
                    /><path class={classNames(styles, 'sketch-cost')} d="M16 74Q148 73 201 17" /><text
                      class={styles.scope}
                      x="194"
                      y="87"
                      font-size="10">n</text
                    ></svg
                  >
                {/if}
              </div>
              <nav class={classNames(styles, 'library-links')} aria-label="{entry.title} topics">
                {#each entry.links as link}<a class={styles.scope} href={link.href}
                    >{link.title}<span class={styles.scope}>→</span></a
                  >{/each}
              </nav>
            </article>
          {/each}
        </section>
        <section class={classNames(styles, 'library-bridge')}>
          <div class={styles.scope}>
            <p class={classNames(styles, 'library-label')}>One idea across subjects</p>
            <h2 class={styles.scope}>Follow merge sort beyond the array.</h2>
            <p class={styles.scope}>
              The same algorithm can teach you how data moves, why the time is n log n, and where the extra memory goes.
            </p>
          </div>
          <nav class={styles.scope} aria-label="Merge sort learning path">
            <a class={styles.scope} href="#/algorithms/merge/play"
              ><span class={styles.scope}>01</span> Watch the merge</a
            ><span class={classNames(styles, 'path-arrow')} aria-hidden="true">→</span><a
              class={styles.scope}
              href="#/discrete/master-theorem/visualize"><span class={styles.scope}>02</span> Count the levels</a
            ><span class={classNames(styles, 'path-arrow')} aria-hidden="true">→</span><a
              class={styles.scope}
              href="#/complexity/space/examples"><span class={styles.scope}>03</span> Account for the buffer</a
            >
          </nav>
        </section>
      {:else if view === 'resources'}
        <section class={classNames(styles, 'resource-directory')}>
          <p class={classNames(styles, 'library-label')}>Other places to learn</p>
          <h2 class={styles.scope}>Use the explanation that clicks for you.</h2>
          <p class={classNames(styles, 'resource-intro')}>
            These complement this guide. Paid access elsewhere is optional; nothing on this site requires buying another
            service.
          </p>
          {#each resources as resource}<article class={classNames(styles, 'resource-row')}>
              <div class={styles.scope}>
                <h3 class={styles.scope}>
                  <a class={styles.scope} href={resource.href} target="_blank" rel="noopener noreferrer"
                    >{resource.title} ↗</a
                  >
                </h3>
                <p class={styles.scope}>{resource.use}</p>
              </div>
              <div class={styles.scope}>
                <span class={styles.scope}>{resource.access}</span>{#if resource.details}<a
                    class={styles.scope}
                    href={resource.details}
                    target="_blank"
                    rel="noopener noreferrer">Access details ↗</a
                  >{/if}
              </div>
            </article>{/each}
          <p class={classNames(styles, 'resource-note')}>
            Independent resources; no affiliation. Check each provider for current access options and terms.
          </p>
        </section>
      {:else if view === 'author'}
        <article class={classNames(styles, 'author-note')}>
          <p class={classNames(styles, 'library-label')}>From the author</p>
          <h2 class={styles.scope}>This began with frustration.</h2>
          <p class={styles.scope}>
            During my Data Structures and Algorithms class, I wanted a free, open-source place that explained things in
            a way that felt intuitive to me. I needed to see what moved, which values were being compared, and why the
            next step was valid—not just memorize a finished array or a time-complexity formula. This site grew out of
            that need.
          </p>
          <p class={styles.scope}>
            Coding agents can produce implementations quickly. That makes understanding the underlying ideas more
            important to me, not less. These algorithms are part of the machinery behind the software we use every day.
            We should be able to ask why they work, what they cost, and when a different approach would be better.
          </p>
          <p class={styles.scope}>
            There is a Chesterton’s-fence lesson here: understand what a structure is doing before tearing it down. I
            want this guide to help us inspect those fences, question them intelligently, and improve things with a
            reason—not simply accept generated code because it runs.
          </p>
          <p class={styles.scope}>
            This is meant to outlive one class. Students can fork it for their own study habits; instructors can adapt
            it for future classes; anyone can help make an explanation clearer. Learning and teaching should not require
            paying an arm and a leg. The project is MIT-licensed, so you can reuse and adapt it while retaining the
            license notice.
          </p>
          <p class={classNames(styles, 'author-signature')}>— Brandon Calderon-Morales</p>
          <nav class={styles.scope} aria-label="Help improve this guide">
            <a
              class={styles.scope}
              href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer">Contribute an improvement ↗</a
            ><a
              class={styles.scope}
              href="https://github.com/BA-CalderonMorales/algorithm-visual-learning"
              target="_blank"
              rel="noopener noreferrer">Fork the repository ↗</a
            ><a
              class={styles.scope}
              href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/LICENSE"
              target="_blank"
              rel="noopener noreferrer">Read the MIT license ↗</a
            >
          </nav>
        </article>
      {/if}
    </div>
  </div>
{/if}
