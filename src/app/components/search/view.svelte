<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';

  let { vm } = $props();
</script>

{#if vm.globalSearchOpen}
  <div class={classNames(styles, 'search-overlay')} role="presentation" onclick={vm.closeSearchBackdrop}>
    <dialog open class={classNames(styles, 'site-search')} aria-modal="true" aria-labelledby="site-search-title">
      <h2 id="site-search-title" class={classNames(styles, 'visually-hidden')}>Search the study guide</h2>
      <div class={classNames(styles, 'site-search-field')}>
        <svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true"
          ><circle class={styles.scope} cx="8.5" cy="8.5" r="5.5"></circle><path class={styles.scope} d="m13 13 4 4"
          ></path></svg
        >
        <input
          class={styles.scope}
          type="search"
          bind:this={vm.globalSearchInput}
          bind:value={vm.globalSearchQuery}
          oninput={vm.resetSearchSelection}
          onkeydown={vm.handleSearchKeydown}
          placeholder="Search algorithms, proofs, complexity…"
          aria-label="Search topics"
          aria-controls="site-search-results"
          aria-activedescendant={vm.searchResults[vm.activeSearchIndex]
            ? `search-result-${vm.activeSearchIndex}`
            : undefined}
        />
        <kbd class={styles.scope}>ESC</kbd>
      </div>
      <div
        id="site-search-results"
        class={classNames(styles, 'site-search-results')}
        role="listbox"
        aria-label="Search results"
      >
        {#each vm.searchResults as result, index (result.href + result.title)}
          <a
            id="search-result-{index}"
            class={classNames(styles, 'site-search-result', { 'search-result-active': index === vm.activeSearchIndex })}
            role="option"
            aria-selected={index === vm.activeSearchIndex}
            href={result.href}
            onclick={(event) => vm.selectSearchResult(event, result)}
            onmouseenter={() => (vm.activeSearchIndex = index)}
          >
            <span class={classNames(styles, 'search-result-copy')}
              ><strong class={styles.scope}>{result.title}</strong><small class={styles.scope}
                >{result.description}</small
              ></span
            >
            <span class={classNames(styles, 'search-result-group')}>{result.group}</span>
          </a>
        {:else}
          <p class={classNames(styles, 'site-search-empty')}>
            No matching topics. Try a concept like “pivot”, “induction”, or “space”.
          </p>
        {/each}
      </div>
      <div class={classNames(styles, 'site-search-hint')}>
        <span class={styles.scope}><kbd class={styles.scope}>↑</kbd><kbd class={styles.scope}>↓</kbd> to navigate</span
        ><span class={styles.scope}><kbd class={styles.scope}>Enter</kbd> to open</span><span class={styles.scope}
          >Search lessons and algorithms</span
        >
      </div>
    </dialog>
  </div>
{/if}
