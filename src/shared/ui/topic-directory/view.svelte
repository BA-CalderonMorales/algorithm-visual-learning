<script>
  import styles from './view.module.css';
  import { classNames } from '../class-names.ts';
  import { lessonHref } from '../../study/routing.ts';
  let { collection, lessons, heroVisible = $bindable(false) } = $props();
</script>

{#if heroVisible}
  <section class={classNames(styles, 'library-heading domain-heading')}>
    <a class={classNames(styles, 'library-back')} href="#/home">← Study home</a>
    <h1 class={styles.scope}>{collection.title}</h1>
    <p class={styles.scope}>{collection.intro}</p>
    <button class={classNames(styles, 'hero-visibility-toggle')} onclick={() => (heroVisible = false)}
      >Hide intro <span class={styles.scope} aria-hidden="true">⌃</span></button
    >
  </section>
{:else}
  <div class={classNames(styles, 'hero-collapsed-strip')}>
    <span class={styles.scope}>{collection.title}</span><button
      class={classNames(styles, 'hero-visibility-toggle')}
      onclick={() => (heroVisible = true)}>Show intro <span class={styles.scope} aria-hidden="true">⌄</span></button
    >
  </div>
{/if}
<section class={classNames(styles, 'topic-directory')} aria-label="{collection.title} topics">
  {#each collection.topics as id, index}
    {@const lesson = lessons[id]}
    <article class={classNames(styles, 'topic-row')}>
      <span class={classNames(styles, 'topic-number')}>0{index + 1}</span>
      <div class={styles.scope}>
        <h2 class={styles.scope}>
          <a class={styles.scope} href={lessonHref(lesson)}>{lesson.title}</a>
        </h2>
        <p class={styles.scope}>{lesson.question}</p>
        <small class={styles.scope}>{lesson.intro}</small>
      </div>
      <nav class={styles.scope} aria-label="{lesson.title} entry points">
        <a class={styles.scope} href={lessonHref(lesson)}>Understand →</a><a
          class={styles.scope}
          href={lessonHref(lesson, 'visualize')}>Visualize →</a
        >
      </nav>
    </article>
  {/each}
</section>
<section class={classNames(styles, 'library-bridge')}>
  <div class={styles.scope}>
    <p class={classNames(styles, 'library-label')}>Connect it</p>
    <p class={styles.scope}>{collection.bridge}</p>
  </div>
  <nav class={styles.scope} aria-label="Related domains">
    {#each collection.links as link}<a class={styles.scope} href={link.href}>{link.title} →</a>{/each}
  </nav>
</section>
