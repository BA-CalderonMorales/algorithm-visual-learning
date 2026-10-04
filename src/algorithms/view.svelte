<script>
  import styles from './view.module.css';
  import { classNames } from '../shared/ui/class-names.ts';
  import LibraryLayout from '../shared/ui/library-layout/view.svelte';
  import DomainConnections from '../shared/ui/domain-connections/view.svelte';
  import { directoryTabs } from '../shared/study/library.ts';
  let { vm } = $props();
</script>

<LibraryLayout
  title="Algorithms"
  heading="Sorting, one move at a time."
  intro="See the array change, read why each move happens, then compare beginner-friendly and typed implementations across languages."
  tabs={directoryTabs('#/algorithms/sorting')}
  selected={vm.directoryView}
  idPrefix="algorithms-directory-tab"
  edgeToEdge={vm.directoryView === 'explore'}
  bind:heroVisible={vm.heroVisible}
>
  {#if vm.directoryView === 'explore'}
    <section class={classNames(styles, 'catalog')} aria-label="Sorting algorithms">
      <div class={classNames(styles, 'catalog-toolbar')}>
        <label class={classNames(styles, 'search')}
          ><span class={styles.scope}>Filter</span><input
            class={styles.scope}
            bind:value={vm.query}
            placeholder="Try ‘divide and conquer’"
          /></label
        >
      </div>
      <div class={classNames(styles, 'catalog-table-wrap')}>
        <table
          class={classNames(styles, 'catalog-table')}
          aria-label="Sorting algorithm comparison"
          aria-describedby="catalog-sort-help"
        >
          <caption class={classNames(styles, 'visually-hidden')} id="catalog-sort-help">
            Choose a column heading to sort. Difficulty is a learning estimate: 1 is gentlest, 7 is most involved.
          </caption>
          <thead class={styles.scope}
            ><tr class={styles.scope}>
              <th
                class={styles.scope}
                scope="col"
                aria-sort={vm.sortBy === 'name' ? (vm.sortDirection === 1 ? 'ascending' : 'descending') : 'none'}
                ><button class={classNames(styles, 'sort-button')} onclick={() => vm.sortCatalog('name')}
                  >Algorithm <span class={styles.scope} aria-hidden="true"
                    >{vm.sortBy === 'name' ? (vm.sortDirection === 1 ? '↑' : '↓') : '↕'}</span
                  ></button
                ></th
              >
              <th
                class={styles.scope}
                scope="col"
                aria-sort={vm.sortBy === 'difficulty' ? (vm.sortDirection === 1 ? 'ascending' : 'descending') : 'none'}
                ><button
                  class={classNames(styles, 'sort-button')}
                  title="Learning difficulty: 1 = gentlest, 7 = most involved"
                  onclick={() => vm.sortCatalog('difficulty')}
                  >Difficulty <span class={styles.scope} aria-hidden="true"
                    >{vm.sortBy === 'difficulty' ? (vm.sortDirection === 1 ? '↑' : '↓') : '↕'}</span
                  ></button
                ></th
              >
              <th class={styles.scope} scope="col">Core idea</th>
              <th
                class={styles.scope}
                scope="col"
                aria-sort={vm.sortBy === 'divide' ? (vm.sortDirection === 1 ? 'ascending' : 'descending') : 'none'}
                ><button class={classNames(styles, 'sort-button')} onclick={() => vm.sortCatalog('divide')}
                  >Divide &amp; conquer <span class={styles.scope} aria-hidden="true"
                    >{vm.sortBy === 'divide' ? (vm.sortDirection === 1 ? '↑' : '↓') : '↕'}</span
                  ></button
                ></th
              >
              <th
                class={styles.scope}
                scope="col"
                aria-sort={vm.sortBy === 'lower' ? (vm.sortDirection === 1 ? 'ascending' : 'descending') : 'none'}
                ><button class={classNames(styles, 'sort-button')} onclick={() => vm.sortCatalog('lower')}
                  >Lower bound <span class={styles.scope} aria-hidden="true"
                    >{vm.sortBy === 'lower' ? (vm.sortDirection === 1 ? '↑' : '↓') : '↕'}</span
                  ></button
                ></th
              >
              <th
                class={styles.scope}
                scope="col"
                aria-sort={vm.sortBy === 'upper' ? (vm.sortDirection === 1 ? 'ascending' : 'descending') : 'none'}
                ><button class={classNames(styles, 'sort-button')} onclick={() => vm.sortCatalog('upper')}
                  >Upper bound <span class={styles.scope} aria-hidden="true"
                    >{vm.sortBy === 'upper' ? (vm.sortDirection === 1 ? '↑' : '↓') : '↕'}</span
                  ></button
                ></th
              >
              <th class={styles.scope} scope="col"
                ><span class={classNames(styles, 'visually-hidden')}>Study links</span></th
              >
            </tr></thead
          >
          <tbody class={styles.scope}>
            {#each vm.displayedAlgorithms as algorithm (algorithm.id)}
              <tr class={styles.scope}>
                <th class={styles.scope} scope="row" data-label="Algorithm"
                  ><a class={classNames(styles, 'catalog-algorithm-link')} href="#/algorithms/{algorithm.id}/understand"
                    >{algorithm.name}<span class={styles.scope} aria-hidden="true">↗</span></a
                  ></th
                >
                <td class={styles.scope} data-label="Difficulty"
                  ><span
                    class={classNames(styles, 'difficulty-rating')}
                    aria-label="Difficulty {algorithm.difficulty} out of 7"
                    >{algorithm.difficulty}<small class={styles.scope}>/7</small></span
                  ></td
                >
                <td class={styles.scope} data-label="Core idea"
                  ><span class={classNames(styles, 'catalog-cue')}>{algorithm.cue}</span><span
                    class={classNames(styles, 'catalog-note')}>{algorithm.extra}</span
                  ></td
                >
                <td class={styles.scope} data-label="Divide &amp; conquer"
                  ><span class={classNames(styles, 'dnc', { yes: algorithm.divide.startsWith('Yes') })}
                    >{algorithm.divide}</span
                  ></td
                >
                <td data-label="Lower bound" class={classNames(styles, 'catalog-bound')}>{algorithm.lower}</td>
                <td data-label="Upper bound" class={classNames(styles, 'catalog-bound')}>{algorithm.upper}</td>
                <td class={styles.scope} data-label="Study links"
                  ><div class={classNames(styles, 'catalog-actions')}>
                    <a class={classNames(styles, 'catalog-step-link')} href="#/algorithms/{algorithm.id}/walkthrough"
                      >Trace steps</a
                    ><a class={classNames(styles, 'catalog-code-link')} href="#/algorithms/{algorithm.id}/python"
                      >Python</a
                    >
                  </div></td
                >
              </tr>
            {:else}<tr class={styles.scope}
                ><td class={styles.scope} colspan="7"
                  ><p class={classNames(styles, 'empty')}>No matches. Try a sort name or a memory cue.</p></td
                ></tr
              >{/each}
          </tbody>
        </table>
      </div>
      <p class={classNames(styles, 'section-footnote')}>
        These are quick per-algorithm reminders. The <button
          class={classNames(styles, 'inline-link')}
          onclick={() => vm.openPage('complexity', 'time')}>Complexity domain</button
        > teaches how to analyze bounds and cases in general.
      </p>
    </section>
  {:else}
    <DomainConnections
      domain="algorithms"
      explanation="Follow what moves first. Then use proofs to explain why it works, and complexity to understand the work and memory it needs."
    />
  {/if}
</LibraryLayout>
