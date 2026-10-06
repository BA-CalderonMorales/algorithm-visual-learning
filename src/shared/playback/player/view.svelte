<script>
  import styles from './view.module.css';
  import { classNames } from '../../ui/class-names.ts';
  import NavigationLink from '../../ui/navigation-link/view.svelte';
  import { createViewModel } from './view-model.svelte.ts';
  let {
    film,
    legend = [],
    narration = null,
    embedded = false,
    lessonPlayer = false,
    variants = [],
    sorting = false,
    renderer,
    sceneDescription,
  } = $props();
  const vm = createViewModel(() => ({
    film,
    legend,
    narration,
    embedded,
    lessonPlayer,
    variants,
    sorting,
    renderer,
    sceneDescription,
  }));
</script>

<section
  class={classNames(styles, 'concept-film', {
    embedded,
    'lesson-player': lessonPlayer,
    'selection-play': film.id === 'selection',
  })}
  bind:this={vm.player}
  aria-label="{vm.selectedFilm.title} animation player"
>
  <header class={classNames(styles, 'scene-heading')}>
    <div class={classNames(styles, 'scene-meta')}>
      <span class={classNames(styles, 'phase')}>{vm.scene.phase}</span>
      <span class={styles.scope} aria-label="Scene progress">{vm.scene.progress}</span>
    </div>
    <h2 class={styles.scope}>{vm.current.scene.title}</h2>
    {#if vm.examples}
      <label class={classNames(styles, 'film-example')}>
        {film.id === 'master' ? 'Recurrence' : 'Example'}
        <select
          class={styles.scope}
          bind:value={vm.variant}
          onchange={vm.changeVariant}
          aria-label={film.id === 'master' ? 'Recurrence' : 'Visualization example'}
        >
          {#each vm.examples as choice}<option class={styles.scope} value={choice.id}>{choice.label}</option>{/each}
        </select>
      </label>
    {/if}
    <div class={classNames(styles, 'scene-context')}>
      {#if vm.scene.boundary}<span class={styles.scope}>{vm.scene.boundary}</span>{/if}
      {#each vm.scene.facts ?? [] as fact}<span class={styles.scope} style:color={vm.playPalette[fact.role]}
          >{fact.label}: <strong class={styles.scope}>{fact.value}</strong></span
        >{/each}
      {#if vm.scene.minimum != null}<span class={classNames(styles, 'minimum')}
          >Smallest found: <strong class={styles.scope}>{vm.scene.minimum}</strong></span
        >{/if}
    </div>
  </header>

  <div
    class={classNames(styles, 'film-stage', { sorting: vm.isSorting, compact: vm.compact })}
    style:--stage-aspect={vm.stageAspect}
  >
    <canvas class={styles.scope} bind:this={vm.canvas} aria-label="{vm.current.scene.title}. {vm.current.scene.caption}"
      >{vm.current.scene.caption}</canvas
    >
  </div>
  <p class={classNames(styles, 'film-scene-caption')}>
    {vm.voiceActive ? vm.clips[vm.current.index].text : vm.current.scene.caption}
  </p>

  <div class={classNames(styles, 'film-key')} aria-label="Animation colors">
    {#each vm.colorKey as [role, name]}<span class={styles.scope}
        ><i class={styles.scope} style:background={vm.playPalette[role]}></i>{name}</span
      >{/each}
  </div>

  <div class={classNames(styles, 'player-bar', { 'film-narration': vm.isSorting })}>
    <div class={classNames(styles, 'film-controls')} aria-label="Playback controls">
      <button
        class={classNames(styles, 'film-play icon-button')}
        onclick={vm.togglePlay}
        aria-label={vm.playing ? 'Pause animation' : 'Play animation'}
        title={vm.playing ? 'Pause animation' : 'Play animation'}>{vm.playing ? 'Ⅱ' : '▶'}</button
      >
      <button
        class={classNames(styles, 'icon-button')}
        onclick={() => vm.stepScene(-1)}
        disabled={vm.current.index === 0}
        aria-label="Previous scene"
        title="Previous scene">←</button
      >
      <button
        class={classNames(styles, 'icon-button')}
        onclick={() => vm.stepScene(1)}
        disabled={vm.current.index === vm.selectedFilm.frames.length - 1}
        aria-label="Next scene"
        title="Next scene">→</button
      >
      <div class={classNames(styles, 'direction-controls')}>
        <button
          class={classNames(styles, 'icon-button', { chosen: vm.reverse })}
          onclick={vm.toggleReverse}
          aria-label="Reverse playback"
          title={vm.reverse ? 'Return to forward playback' : 'Reverse playback'}
          aria-pressed={vm.reverse}>⇄</button
        >
        <button
          class={classNames(styles, 'icon-button')}
          onclick={vm.restart}
          aria-label="Restart animation"
          title="Restart animation">↺</button
        >
      </div>
      {#if vm.isSorting && !embedded && !lessonPlayer}<button
          class={classNames(styles, 'icon-button', { chosen: vm.voiceOn })}
          disabled={!vm.audioSupported || !vm.voiceAvailable}
          onclick={vm.toggleVoice}
          aria-label="Voice narration"
          aria-pressed={vm.voiceOn}
          title={vm.voiceOn ? 'Turn voice off (AI-generated Echo)' : 'Turn voice on (AI-generated Echo)'}>♫</button
        >
        {#if vm.voiceOn && vm.voiceAvailable}<button
            class={classNames(styles, 'icon-button')}
            onclick={vm.replayNarration}
            aria-label="Replay narration"
            title="Replay this scene’s voice">↺♫</button
          >{/if}
      {/if}
      <label class={classNames(styles, 'film-speed')}
        ><span class={classNames(styles, 'visually-hidden')}>Speed</span><select
          class={styles.scope}
          bind:value={vm.speed}
          onchange={vm.changeSpeed}
          aria-label="Playback speed"
          title="Playback speed"
        >
          <option class={styles.scope} value={0.5}>0.5×</option><option class={styles.scope} value={1}>1×</option
          ><option class={styles.scope} value={1.5}>1.5×</option><option class={styles.scope} value={2}>2×</option
          ><option class={styles.scope} value={2.5}>2.5×</option><option class={styles.scope} value={3}>3×</option>
        </select></label
      >
      {#if vm.videoAvailable}<a
          class={classNames(styles, 'film-video icon-button')}
          href={vm.clipUrl}
          target="_blank"
          rel="noopener"
          aria-label="Open video"
          title="Open video in a new tab">↗</a
        >{/if}
      <span class={classNames(styles, 'film-time')} aria-label="Playback time"
        >{vm.formatTime(vm.seconds)} / {vm.formatTime(vm.selectedFilm.duration)}</span
      >
    </div>
    <label class={classNames(styles, 'film-scrubber')}
      ><span class={classNames(styles, 'visually-hidden')}>Seek animation</span><input
        class={styles.scope}
        type="range"
        min="0"
        max={vm.selectedFilm.duration}
        step="0.01"
        bind:value={vm.seconds}
        oninput={vm.seek}
        aria-label="Seek animation"
        title="Seek animation"
        aria-valuetext="{vm.formatTime(vm.seconds)}: {vm.current.scene.title}"
      /></label
    >
    {#if vm.isSorting && !embedded && !lessonPlayer}<p class={classNames(styles, 'voice-disclosure')}>
        Optional voice · AI-generated Echo recording
      </p>
      <p
        class={classNames(styles, 'film-voice-status', {
          'voice-status': vm.status.attention,
          'visually-hidden': !vm.status.attention,
        })}
        role="status"
      >
        {vm.status.message}
      </p>{/if}
  </div>

  <details class={classNames(styles, 'more')}>
    <summary class={styles.scope}>Read the explanation</summary>
    <ol class={classNames(styles, 'film-transcript')}>
      {#each vm.selectedFilm.frames as scene, index}<li class={styles.scope}>
          <button
            class={styles.scope}
            onclick={() => vm.jumpScene(index)}
            title="Jump to scene {index + 1}"
            aria-current={index === vm.current.index ? 'step' : undefined}
            ><span class={classNames(styles, 'scene-jump-label')}>{scene.title}</span><span
              class={classNames(styles, 'scene-jump-icon')}
              aria-hidden="true">▶</span
            ></button
          >
          <p class={styles.scope}>{vm.voiceAvailable ? vm.clips[index].text : scene.caption}</p>
        </li>{/each}
    </ol>
    {#if vm.selectedFilm.note}<p class={classNames(styles, 'film-note')}>{vm.selectedFilm.note}</p>{/if}
    <nav class={classNames(styles, 'film-connections')} aria-label="Related ideas">
      {#each vm.selectedFilm.connections as connection}<NavigationLink
          href={connection.href}
          label={connection.title}
        />{/each}
    </nav>
  </details>
</section>
