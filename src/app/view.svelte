<script>
  import IntroToggle from '../shared/ui/intro-toggle/view.svelte';
  import styles from './view.module.css';
  import { classNames } from '../shared/ui/class-names.ts';
  import AlgorithmLesson from './../algorithms/components/lesson/view.svelte';
  import Catalog from './../algorithms/view.svelte';
  import Search from './components/search/view.svelte';
  import Footer from './components/footer/view.svelte';
  import Header from './components/header/view.svelte';
  import Navigation from './components/navigation/view.svelte';
  import ReadingNavigation from './components/reading-navigation/view.svelte';
  import StudyLesson from '../shared/ui/study-lesson/view.svelte';
  import StudyLibrary from '../explore/view.svelte';
  import TopicDirectory from '../shared/ui/topic-directory/view.svelte';

  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel();
</script>

<svelte:head>
  <title>{vm.pageTitle} · DSA Study Studio</title>
  <meta
    class={styles.scope}
    name="description"
    content="A visual, step-by-step study guide for algorithms, discrete mathematics, and time and space complexity."
  />
</svelte:head>

<div class={classNames(styles, 'app-frame')}>
  {#if vm.navOpen}<button
      class={classNames(styles, 'nav-scrim')}
      aria-label="Close navigation"
      onclick={() => (vm.navOpen = false)}
    ></button>{/if}
  <Navigation {vm} />

  <div class={classNames(styles, 'content-column')} inert={vm.navOpen}>
    <Header {vm} />

    <main
      class={classNames(styles, 'page-content', {
        'wide-algorithm-page': vm.domain === 'algorithms' && vm.topic === 'algorithm',
      })}
    >
      {#if vm.domain === 'overview'}
        <StudyLibrary libraryDomain="home" view={vm.homeView} bind:heroVisible={vm.heroVisible} />
      {:else if vm.domain === 'algorithms' && vm.topic === 'catalog'}
        <Catalog {vm} />
      {:else if vm.domain === 'algorithms' && vm.topic === 'algorithm' && vm.selectedAlgorithm}
        <AlgorithmLesson {vm} />
      {:else if (vm.domain === 'discrete' || vm.domain === 'complexity') && vm.topic === 'index'}
        <TopicDirectory
          domain={vm.domain}
          view={vm.directoryView}
          collection={vm.studyDomains[vm.domain]}
          lessons={vm.studyLessons}
          bind:heroVisible={vm.heroVisible}
        />
      {:else if (vm.domain === 'discrete' || vm.domain === 'complexity') && vm.selectedStudyLesson}
        {#if vm.heroVisible}
          <section class={classNames(styles, 'page-hero compact-hero study-page-heading')}>
            <a class={classNames(styles, 'study-back')} href="#/{vm.domain}">← {vm.studyDomains[vm.domain].title}</a>
            <h1 class={styles.scope}>{vm.selectedStudyLesson.title}</h1>
            <p class={classNames(styles, 'intro')}>{vm.selectedStudyLesson.intro}</p>
            <IntroToggle bind:visible={vm.heroVisible} />
          </section>
        {:else}
          <div class={classNames(styles, 'hero-collapsed-strip')}>
            <span class={styles.scope}>{vm.selectedStudyLesson.title}</span><IntroToggle
              bind:visible={vm.heroVisible}
            />
          </div>
        {/if}
        {#key vm.selectedStudyLesson.id}<StudyLesson
            lesson={vm.selectedStudyLesson}
            view={vm.studyView}
            film={vm.playFilms[vm.selectedStudyLesson.id]}
            variants={vm.conceptVariants[vm.selectedStudyLesson.id]}
            legend={vm.conceptLegends[vm.selectedStudyLesson.id]}
          />{/key}
      {/if}
      <ReadingNavigation {vm} />
    </main>
    <Footer {vm} />
  </div>
</div>

<Search {vm} />
