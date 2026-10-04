<script>
  import styles from './view.module.css';
  import { classNames } from '../../ui/class-names.ts';

  let {
    film,
    embedded = false,
    lessonPlayer = false,
    variants = [],
    legend = [],
    narration = null,
    sorting = false,
  } = $props();
  import { createViewModel } from './view-model.svelte.ts';
  const vm = createViewModel(() => ({ film, embedded, lessonPlayer, variants, legend, narration, sorting }));
</script>

<section
  class={classNames(styles, 'concept-film', { embedded: embedded, 'lesson-player': lessonPlayer })}
  bind:this={vm.player}
  aria-label="{vm.selectedFilm.title} animation player"
>
  <header class={classNames(styles, 'film-heading')}>
    <div class={styles.scope}>
      <span class={classNames(styles, 'film-label')}>{embedded ? 'See it happen' : 'Play'}</span>
      <h2 class={styles.scope}>{vm.selectedFilm.title}</h2>
      <p class={styles.scope}>{vm.selectedFilm.takeaway}</p>
    </div>
    {#if vm.examples}
      <label class={classNames(styles, 'film-example')}
        >{film.id === 'master' ? 'Recurrence' : 'Example'}<select
          class={styles.scope}
          bind:value={vm.variant}
          onchange={vm.changeVariant}
          aria-label={film.id === 'master' ? 'Recurrence' : 'Visualization example'}
          >{#each vm.examples as choice}<option class={styles.scope} value={choice.id}>{choice.label}</option
            >{/each}</select
        ></label
      >
    {/if}
  </header>
  <div class={classNames(styles, 'film-stage', { compact: vm.compact, sorting: vm.isSorting })}>
    <canvas class={styles.scope} bind:this={vm.canvas} aria-label="{vm.current.scene.title}. {vm.current.scene.caption}"
      >{vm.current.scene.title}. {vm.current.scene.caption}</canvas
    >
    {#if vm.isSorting}<p class={classNames(styles, 'film-scene-caption')}>
        {vm.voiceActive ? vm.clips[vm.current.index].text : vm.current.scene.caption}
      </p>{/if}
  </div>
  {#if vm.isSorting && !embedded && !lessonPlayer}
    <div class={classNames(styles, 'film-narration')} aria-label="Echo narration controls">
      <button
        class={classNames(styles, '', { chosen: vm.voiceOn })}
        disabled={!vm.audioSupported || !vm.voiceAvailable}
        aria-label="Voice narration"
        aria-pressed={vm.voiceOn}
        onclick={vm.toggleVoice}>{vm.voiceOn ? '♫ Echo on' : '♫ Echo off'}</button
      >
      {#if vm.voiceOn}
        <button class={styles.scope} onclick={vm.replayNarration} aria-label="Replay narration"
          >↺ Hear this scene</button
        >
      {/if}
      <span class={classNames(styles, 'film-voice-status')} role="status"
        >{!vm.audioSupported
          ? 'Audio is unavailable here; visual playback still works.'
          : !vm.voiceAvailable
            ? 'Recordings need updating; visual playback still works.'
            : vm.voiceStatus === 'error'
              ? 'Audio could not play. Visuals continue; try Echo again.'
              : vm.voiceOn && vm.reverse
                ? 'Echo is quiet during reverse.'
                : !vm.voiceOn
                  ? 'Recorded Echo voice · enable, then press Play.'
                  : vm.voiceStatus === 'loading'
                    ? 'Loading this scene’s recording…'
                    : vm.playing && vm.voiceStatus === 'done'
                      ? 'Finishing the motion…'
                      : vm.playing
                        ? 'Listening · each scene stays with its explanation.'
                        : vm.voiceStatus === 'paused'
                          ? 'Paused · Play resumes the voice and visuals.'
                          : 'Play to hear this scene. AI-generated voice.'}</span
      >
    </div>
  {/if}
  <div class={classNames(styles, 'film-controls')}>
    <button
      class={classNames(styles, 'film-play')}
      onclick={vm.togglePlay}
      aria-label={vm.playing ? 'Pause animation' : 'Play animation'}>{vm.playing ? 'Ⅱ Pause' : '▶ Play'}</button
    >
    <button class={styles.scope} onclick={vm.restart} aria-label="Restart animation">↺ Restart</button>
    <button
      class={classNames(styles, '', { chosen: vm.reverse })}
      aria-pressed={vm.reverse}
      onclick={vm.toggleReverse}
      aria-label="Reverse playback">⇄ Reverse</button
    >
    {#if vm.isSorting}<button
        class={styles.scope}
        onclick={() => vm.stepScene(-1)}
        disabled={vm.current.index === 0}
        aria-label="Previous scene">← Previous</button
      ><button
        class={styles.scope}
        onclick={() => vm.stepScene(1)}
        disabled={vm.current.index === vm.selectedFilm.frames.length - 1}
        aria-label="Next scene">Next →</button
      >{/if}
    <label class={classNames(styles, 'film-speed')}
      ><span class={styles.scope}>Speed</span><select
        class={styles.scope}
        bind:value={vm.speed}
        onchange={vm.changeSpeed}
        aria-label="Playback speed"
        ><option class={styles.scope} value={0.5}>0.5×</option><option class={styles.scope} value={1}>1×</option><option
          class={styles.scope}
          value={1.5}>1.5×</option
        ><option class={styles.scope} value={2}>2×</option><option class={styles.scope} value={2.5}>2.5×</option><option
          class={styles.scope}
          value={3}>3×</option
        ></select
      ></label
    >
    <span class={classNames(styles, 'film-time')} aria-label="Playback time"
      >{vm.formatTime(vm.seconds)} / {vm.formatTime(vm.selectedFilm.duration)}</span
    >
    {#if vm.videoAvailable}<a class={classNames(styles, 'film-video')} href={vm.clipUrl} target="_blank" rel="noopener"
        >Open video ↗</a
      >{/if}
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
      aria-valuetext="{vm.formatTime(vm.seconds)}: {vm.current.scene.title}"
    /></label
  >
  <nav class={classNames(styles, 'film-chapters')} aria-label="Animation chapters">
    {#each vm.chapters as chapter}<button
        class={classNames(styles, '', { chosen: vm.current.scene.chapter === chapter.title })}
        onclick={() => vm.jump(chapter.time)}>{chapter.title}</button
      >{/each}
  </nav>
  <div class={classNames(styles, 'film-key')} aria-label="Animation colors">
    {#each vm.colorKey as [role, name]}<span class={styles.scope}
        ><i class={styles.scope} style:background={vm.playPalette[role]}></i>{name}</span
      >{/each}
  </div>
  <div class={classNames(styles, 'film-bottom')}>
    {#if vm.selectedFilm.note}<p class={classNames(styles, 'film-note')}>{vm.selectedFilm.note}</p>{/if}
    <nav class={classNames(styles, 'film-connections')} aria-label="Related ideas">
      <span class={styles.scope}>Connect this idea</span>{#each vm.selectedFilm.connections as connection}<a
          class={styles.scope}
          href={connection.href}>{connection.title} →</a
        >{/each}
    </nav>
    <details class={classNames(styles, 'film-transcript')}>
      <summary class={styles.scope}>Read the explanation</summary>
      <ol class={styles.scope}>
        {#each vm.selectedFilm.frames as scene, index}<li class={styles.scope}>
            <button class={styles.scope} onclick={() => vm.jumpScene(index)}>{scene.title}</button>
            <p class={styles.scope}>{vm.voiceAvailable ? vm.clips[index].text : scene.caption}</p>
          </li>{/each}
      </ol>
    </details>
  </div>
</section>
