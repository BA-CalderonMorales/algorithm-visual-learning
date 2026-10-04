<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';

  let { vm } = $props();
</script>

<aside
  class={classNames(styles, 'sidebar', { 'nav-open': vm.navOpen })}
  aria-label="Study guide navigation"
  aria-hidden={!vm.navOpen}
>
  <a class={classNames(styles, 'brand')} href="#/home" onclick={() => vm.openPage('overview', 'home')}>
    <span class={classNames(styles, 'brand-mark')} aria-hidden="true"
      ><i class={styles.scope}></i><i class={styles.scope}></i><i class={styles.scope}></i></span
    >
    <span class={styles.scope}
      ><strong class={styles.scope}>DSA Study Studio</strong><small class={styles.scope}
        >See the idea. Follow the why.</small
      ></span
    >
  </a>

  <button
    class={classNames(styles, 'nav-link home-link', { active: vm.domain === 'overview' })}
    onclick={() => vm.openPage('overview', 'home')}
  >
    <span class={classNames(styles, 'nav-icon')}>⌂</span> Study home
  </button>

  <nav class={styles.scope}>
    <p class={classNames(styles, 'nav-group-title')}>Algorithms</p>
    <button
      class={classNames(styles, 'nav-link', { active: vm.domain === 'algorithms' })}
      onclick={() => vm.openPage('algorithms', 'catalog')}
    >
      <span class={classNames(styles, 'nav-icon')}>↗</span> Sorting algorithms
      <span class={classNames(styles, 'nav-count')}>7</span>
    </button>

    <p class={classNames(styles, 'nav-group-title')}>Discrete mathematics</p>
    <a
      class={classNames(styles, 'nav-link', { active: vm.isActive('discrete', 'index') })}
      href="#/discrete"
      onclick={() => (vm.navOpen = false)}><span class={classNames(styles, 'nav-icon')}>∑</span> All math topics</a
    >
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('discrete', 'induction') })}
      onclick={() => vm.openPage('discrete', 'induction')}
    >
      <span class={classNames(styles, 'nav-icon')}>∴</span> Proof by induction
    </button>
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('discrete', 'telescoping') })}
      onclick={() => vm.openPage('discrete', 'telescoping')}
    >
      <span class={classNames(styles, 'nav-icon')}>∑</span> Telescoping sums
    </button>
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('discrete', 'master') })}
      onclick={() => vm.openPage('discrete', 'master')}
    >
      <span class={classNames(styles, 'nav-icon')}>T</span> Master theorem
    </button>

    <p class={classNames(styles, 'nav-group-title')}>Complexity</p>
    <a
      class={classNames(styles, 'nav-link', { active: vm.isActive('complexity', 'index') })}
      href="#/complexity"
      onclick={() => (vm.navOpen = false)}><span class={classNames(styles, 'nav-icon')}>◷</span> Time and space</a
    >
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('complexity', 'time') })}
      onclick={() => vm.openPage('complexity', 'time')}
    >
      <span class={classNames(styles, 'nav-icon')}>◷</span> Time complexity
    </button>
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('complexity', 'asymptotic') })}
      onclick={() => vm.openPage('complexity', 'asymptotic')}
    >
      <span class={classNames(styles, 'nav-icon')}>O</span> Asymptotic bounds
    </button>
    <button
      class={classNames(styles, 'nav-link', { active: vm.isActive('complexity', 'space') })}
      onclick={() => vm.openPage('complexity', 'space')}
    >
      <span class={classNames(styles, 'nav-icon')}>▱</span> Space complexity
    </button>

    <p class={classNames(styles, 'nav-group-title')}>Contribute</p>
    <a
      class={classNames(styles, 'nav-link contribute-link')}
      href="https://github.com/BA-CalderonMorales/algorithm-visual-learning/blob/develop/CONTRIBUTING.md"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class={classNames(styles, 'nav-icon')}>＋</span> How to contribute
    </a>
  </nav>

  <div class={classNames(styles, 'sidebar-note')}>
    <span class={classNames(styles, 'note-dot')}></span><span class={styles.scope}
      >Made for curious minds<br class={styles.scope} />and the next class, too.</span
    >
  </div>
</aside>
