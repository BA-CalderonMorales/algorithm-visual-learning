<script>
  import styles from './view.module.css';
  import { classNames } from '../../../shared/ui/class-names.ts';
  let { settings } = $props();
</script>

<svelte:window onclick={settings.closeOutside} onkeydown={settings.handleKeydown} />
<div class={classNames(styles, 'theme-picker')}>
  <button
    class={classNames(styles, 'theme-trigger')}
    aria-label="Choose theme"
    title="Choose theme"
    aria-haspopup="menu"
    aria-expanded={settings.open}
    aria-controls="theme-options"
    bind:this={settings.trigger}
    onclick={settings.toggleMenu}
  >
    <svg class={styles.scope} viewBox="0 0 20 20" aria-hidden="true">
      <circle class={styles.scope} cx="10" cy="10" r="7" />
      <path class={styles.scope} d="M10 3a7 7 0 0 0 0 14Z" />
    </svg>
  </button>
  {#if settings.open}
    <div
      class={classNames(styles, 'theme-options')}
      id="theme-options"
      role="menu"
      aria-label="Study theme"
      bind:this={settings.menu}
    >
      {#each settings.themes as theme}
        <button
          class={classNames(styles, 'theme-option')}
          role="menuitemradio"
          aria-label={theme.name}
          aria-checked={settings.theme === theme.id}
          onclick={() => settings.choose(theme.id)}
        >
          <span class={classNames(styles, 'theme-swatch', theme.id)} aria-hidden="true">
            {#if settings.theme === theme.id}
              <svg class={classNames(styles, 'theme-check')} viewBox="0 0 16 16">
                <path class={styles.scope} d="m3 8 3 3 7-7" />
              </svg>
            {/if}
          </span>
          <span class={classNames(styles, 'theme-copy')}
            ><strong class={styles.scope}>{theme.name}</strong><small class={styles.scope}>{theme.description}</small
            ></span
          >
        </button>
      {/each}
    </div>
  {/if}
</div>
