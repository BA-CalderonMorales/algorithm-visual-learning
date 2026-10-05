<script>
  import IntroHeading from '../shared/ui/intro-heading/view.svelte';
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
  import Problems from '../problems/view.svelte';
  import ProblemLesson from '../problems/two-pointers/view.svelte';

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
      {:else if vm.domain === 'problems'}
        {#if vm.topic === 'index' || vm.topic === 'two-pointers'}
          <Problems view={vm.directoryView} bucket={vm.topic === 'two-pointers'} bind:heroVisible={vm.heroVisible} />
        {:else}
          {#key vm.topic}<ProblemLesson
              id={vm.topic}
              view={vm.studyView}
              approach={vm.problemApproach}
              language={vm.problemLanguage}
              bind:heroVisible={vm.heroVisible}
            />{/key}
        {/if}
      {:else if (vm.domain === 'discrete' || vm.domain === 'complexity') && vm.topic === 'index'}
        <TopicDirectory
          domain={vm.domain}
          view={vm.directoryView}
          collection={vm.studyDomains[vm.domain]}
          lessons={vm.studyLessons}
          bind:heroVisible={vm.heroVisible}
        />
      {:else if (vm.domain === 'discrete' || vm.domain === 'complexity') && vm.selectedStudyLesson}
        <IntroHeading title={vm.selectedStudyLesson.title} bind:visible={vm.heroVisible}>
          <section class={classNames(styles, 'page-hero compact-hero study-page-heading')}>
            <a class={classNames(styles, 'study-back')} href="#/{vm.domain}">← {vm.studyDomains[vm.domain].title}</a>
            <h1 class={styles.scope}>{vm.selectedStudyLesson.title}</h1>
            <p class={classNames(styles, 'intro')}>{vm.selectedStudyLesson.intro}</p>
          </section>
        </IntroHeading>
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
