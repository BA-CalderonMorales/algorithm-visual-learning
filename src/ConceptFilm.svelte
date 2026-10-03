<script>
  import { onMount } from 'svelte';
  import { chaptersFor, sceneAt, conceptVariants, conceptLegends } from './play-models.js';
  import { renderFilm, playPalette } from './play-renderer.js';
  import { narratedTime } from './scene-narration.js';
  import { sortingNarration, narrationSource } from './sorting-narration.js';
  import recordings from './narration-clips.json';
  import { createRecordedNarration, withNarrationTiming } from './recorded-narration.js';

  let { film, embedded = false, lessonPlayer = false } = $props();
  let variant = $state('master');
  let examples = $derived(conceptVariants[film.id]);
  let baseFilm = $derived(examples?.find(v => v.id === variant)?.film ?? film);
  let isSorting = $derived(['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting'].includes(baseFilm.id));
  let clips = $derived(recordings.algorithms[baseFilm.id]);
  let voiceAvailable = $derived(isSorting && !embedded && !lessonPlayer && clips?.length === baseFilm.frames.length && clips.every((clip, i) =>
    clip.text === sortingNarration[baseFilm.id][i].text && clip.source === narrationSource(baseFilm.frames[i]) && clip.duration > 0));
  let selectedFilm = $derived(voiceAvailable && voiceOn && !reverse ? withNarrationTiming(baseFilm, clips) : baseFilm);
  let colorKey = $derived(conceptLegends[film.id] ?? [['key', 'Held / selected'], ['compare', 'Compare'], ['shift', 'Shift'], ['sorted', 'Completed'], ['group', 'Group / pointers']]);
  $effect(() => { if (examples && !examples.some(example => example.id === variant)) variant = examples[0].id; });
  let canvas;
  let player;
  let seconds = $state(0);
  let playing = $state(false);
  let speed = $state(1);
  let reverse = $state(false);
  let reduced = $state(false);
  let compact = $state(false);
  let ready = $state(false);
  let videoAvailable = $state(false);
  let voiceOn = $state(false);
  let audioSupported = $state(false);
  let voiceStatus = $state('idle');
  let voiceActive = $derived(voiceAvailable && voiceOn && !reverse);
  let narrator;
  let current = $derived(sceneAt(selectedFilm, seconds));
  let chapters = $derived(chaptersFor(selectedFilm));
  let clipUrl = $derived(`${import.meta.env.BASE_URL}films/${selectedFilm.id}.webm`);
  const formatTime = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const voiceKey = index => `${baseFilm.id}:${clips[index].url}`;
  const sceneStart = index => selectedFilm.frames.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
  function beginNarration() {
    if (!voiceActive || !narrator) return;
    const position = sceneAt(selectedFilm, seconds);
    narrator.start(voiceKey(position.index), `${import.meta.env.BASE_URL}${clips[position.index].url}`, { rate:speed });
  }
  function toggleVoice() {
    const position = sceneAt(selectedFilm, seconds);
    voiceOn = !voiceOn;
    narrator?.stop();
    seconds = sceneStart(position.index) + (voiceActive ? 0 : Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01));
    if (voiceActive && playing) beginNarration();
  }
  function changeSpeed(event) {
    speed = Number(event.currentTarget.value);
    narrator?.setRate(speed);
  }
  function toggleReverse() {
    const position = sceneAt(selectedFilm, seconds);
    reverse = !reverse;
    narrator?.stop();
    seconds = sceneStart(position.index) + (voiceActive ? 0 : Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01));
    if (voiceActive && playing) beginNarration();
  }
  function seek() { playing = false; narrator?.stop(); }
  function restart() { playing = false; jump(reverse ? selectedFilm.duration : 0); }
  function stepScene(direction) {
    playing = false;
    const index = Math.max(0, Math.min(selectedFilm.frames.length - 1, current.index + direction));
    const start = selectedFilm.frames.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
    // Show the result of a manual step; Play replays its motion with the voice.
    jump(start + Math.min(2, selectedFilm.frames[index].duration - 0.01));
  }
  function replayNarration() {
    const index = current.index;
    reverse = false;
    voiceOn = true;
    jump(sceneStart(index));
    playing = true;
    beginNarration();
  }
  function paint() { if (canvas && ready) renderFilm(canvas, selectedFilm, seconds, { compact, reduced: reduced || (lessonPlayer && !playing) }); }
  function togglePlay() {
    if (playing) { playing = false; narrator?.pause(); return; }
    if (!playing && !reverse && seconds >= selectedFilm.duration) seconds = 0;
    if (!playing && reverse && seconds <= 0) seconds = selectedFilm.duration;
    if (voiceActive) {
      const position = sceneAt(selectedFilm, seconds);
      if (narrator?.key !== voiceKey(position.index)) seconds = position.start;
      beginNarration();
    }
    playing = true;
  }
  function jump(time) {
    narrator?.stop();
    seconds = time; paint();
    if (playing) beginNarration();
    if (lessonPlayer) requestAnimationFrame(() => {
      const scroller = player.closest('.study-visual-scroll');
      const stage = player.querySelector('.film-stage');
      const controls = player.querySelector('.film-controls');
      if (scroller && stage) scroller.scrollTop += stage.getBoundingClientRect().top - scroller.getBoundingClientRect().top - controls.offsetHeight;
    });
  }
  function changeVariant() { playing = false; seconds = 0; }

  $effect(() => { selectedFilm; seconds; reduced; compact; playing; paint(); });
  $effect(() => {
    const url = clipUrl;
    let cancelled = false;
    videoAvailable = false;
    fetch(url, { method: 'HEAD' }).then(response => {
      if (!cancelled) videoAvailable = response.ok && response.headers.get('content-type')?.includes('video');
    }).catch(() => {});
    return () => { cancelled = true; };
  });

  onMount(() => {
    let last = 0, animation;
    audioSupported = typeof window.Audio === 'function';
    if (audioSupported) narrator = createRecordedNarration(window.Audio, status => {
      voiceStatus = status;
      if (status === 'error') {
        const position = sceneAt(selectedFilm, seconds);
        voiceOn = false;
        seconds = sceneStart(position.index) + Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01);
      }
    });
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = preference.matches;
    const updatePreference = () => { reduced = preference.matches; playing = false; narrator?.stop(); };
    preference.addEventListener('change', updatePreference);
    const resize = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      compact = width < 540;
      canvas.width = compact ? 1120 : 1800;
      canvas.height = isSorting ? (compact ? 1020 : 900) : (compact ? 1220 : 1008);
      ready = true; paint();
    });
    resize.observe(player);
    const hidden = () => { if (document.hidden) { playing = false; narrator?.pause(); } };
    document.addEventListener('visibilitychange', hidden);
    const tick = (now) => {
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (playing) {
        if (voiceActive && narrator) {
          beginNarration();
          if (narrator.started) {
            const position = sceneAt(selectedFilm, seconds);
            // Use the recording's clock, not frame rate, while it is speaking.
            // The small tail after its end gives the completed motion breathing room.
            const advance = Math.max(narrator.finished ? delta * speed : 0, narrator.elapsed - position.local);
            seconds = narratedTime(position, advance, narrator.finished);
          }
        } else {
          seconds = Math.max(0, Math.min(selectedFilm.duration, seconds + delta * speed * (reverse ? -1 : 1)));
        }
        if (seconds === 0 && reverse || seconds === selectedFilm.duration && !reverse) playing = false;
        paint();
      }
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation); resize.disconnect();
      document.removeEventListener('visibilitychange', hidden);
      preference.removeEventListener('change', updatePreference);
      narrator?.destroy();
    };
  });
</script>

<section class="concept-film" class:embedded class:lesson-player={lessonPlayer} bind:this={player} aria-label="{selectedFilm.title} animation player">
  <header class="film-heading">
    <div><span class="film-label">{embedded ? 'See it happen' : 'Play'}</span><h2>{selectedFilm.title}</h2><p>{selectedFilm.takeaway}</p></div>
    {#if examples}
      <label class="film-example">{film.id === 'master' ? 'Recurrence' : 'Example'}<select bind:value={variant} onchange={changeVariant} aria-label="{film.id === 'master' ? 'Recurrence' : 'Visualization example'}">{#each examples as choice}<option value={choice.id}>{choice.label}</option>{/each}</select></label>
    {/if}
  </header>
  <div class="film-stage" class:compact class:sorting={isSorting}>
    <canvas bind:this={canvas} aria-label="{current.scene.title}. {current.scene.caption}">{current.scene.title}. {current.scene.caption}</canvas>
    {#if isSorting}<p class="film-scene-caption">{voiceActive ? clips[current.index].text : current.scene.caption}</p>{/if}
  </div>
  {#if isSorting && !embedded && !lessonPlayer}
    <div class="film-narration" aria-label="Echo narration controls">
      <button class:chosen={voiceOn} disabled={!audioSupported || !voiceAvailable} aria-label="Voice narration" aria-pressed={voiceOn} onclick={toggleVoice}>{voiceOn ? '♫ Echo on' : '♫ Echo off'}</button>
      {#if voiceOn}
        <button onclick={replayNarration} aria-label="Replay narration">↺ Hear this scene</button>
      {/if}
      <span class="film-voice-status" role="status">{!audioSupported ? 'Audio is unavailable here; visual playback still works.' : !voiceAvailable ? 'Recordings need updating; visual playback still works.' : voiceStatus === 'error' ? 'Audio could not play. Visuals continue; try Echo again.' : voiceOn && reverse ? 'Echo is quiet during reverse.' : !voiceOn ? 'Recorded Echo voice · enable, then press Play.' : voiceStatus === 'loading' ? 'Loading this scene’s recording…' : playing && voiceStatus === 'done' ? 'Finishing the motion…' : playing ? 'Listening · each scene stays with its explanation.' : voiceStatus === 'paused' ? 'Paused · Play resumes the voice and visuals.' : 'Play to hear this scene. AI-generated voice.'}</span>
    </div>
  {/if}
  <div class="film-controls">
    <button class="film-play" onclick={togglePlay} aria-label={playing ? 'Pause animation' : 'Play animation'}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button>
    <button onclick={restart} aria-label="Restart animation">↺ Restart</button>
    <button class:chosen={reverse} aria-pressed={reverse} onclick={toggleReverse} aria-label="Reverse playback">⇄ Reverse</button>
    {#if isSorting}<button onclick={() => stepScene(-1)} disabled={current.index === 0} aria-label="Previous scene">← Previous</button><button onclick={() => stepScene(1)} disabled={current.index === selectedFilm.frames.length - 1} aria-label="Next scene">Next →</button>{/if}
    <label class="film-speed"><span>Speed</span><select bind:value={speed} onchange={changeSpeed} aria-label="Playback speed"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option><option value={2.5}>2.5×</option><option value={3}>3×</option></select></label>
    <span class="film-time" aria-label="Playback time">{formatTime(seconds)} / {formatTime(selectedFilm.duration)}</span>
    {#if videoAvailable}<a class="film-video" href={clipUrl} target="_blank" rel="noopener">Open video ↗</a>{/if}
  </div>
  <label class="film-scrubber"><span class="visually-hidden">Seek animation</span><input type="range" min="0" max={selectedFilm.duration} step="0.01" bind:value={seconds} oninput={seek} aria-label="Seek animation" aria-valuetext="{formatTime(seconds)}: {current.scene.title}" /></label>
  <nav class="film-chapters" aria-label="Animation chapters">{#each chapters as chapter}<button class:chosen={current.scene.chapter === chapter.title} onclick={() => jump(chapter.time)}>{chapter.title}</button>{/each}</nav>
  <div class="film-key" aria-label="Animation colors">
    {#each colorKey as [role, name]}<span><i style:background={playPalette[role]}></i>{name}</span>{/each}
  </div>
  <div class="film-bottom">
    {#if selectedFilm.note}<p class="film-note">{selectedFilm.note}</p>{/if}
    <nav class="film-connections" aria-label="Related ideas"><span>Connect this idea</span>{#each selectedFilm.connections as connection}<a href={connection.href}>{connection.title} →</a>{/each}</nav>
    <details class="film-transcript"><summary>Read the explanation</summary><ol>{#each selectedFilm.frames as scene, index}<li><button onclick={() => { playing = false; jump(selectedFilm.frames.slice(0, index).reduce((sum, f) => sum + f.duration, 0)); }}>{scene.title}</button><p>{voiceAvailable ? clips[index].text : scene.caption}</p></li>{/each}</ol></details>
  </div>
</section>

<style>
  .concept-film { min-width:0; display:flex; flex:1 1 auto; flex-direction:column; overflow:auto; background:#14181e; scrollbar-width:thin; scrollbar-color:#526777 #14181e; }
  .concept-film.embedded { margin:0 0 26px; overflow:visible; border:1px solid #343e49; }
  .film-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:22px 28px 16px; }
  .film-label { color:#65d9b0; font-size:11px; letter-spacing:.09em; text-transform:uppercase; }
  .film-heading h2 { margin:5px 0; font-size:clamp(20px,2.3vw,27px); letter-spacing:-.03em; }
  .film-heading p { margin:5px 0 0; max-width:750px; color:#a9b6c5; font-size:13px; line-height:1.6; }
  .film-stage { width:min(100%,1080px); align-self:center; flex:none; }
  canvas { display:block; width:100%; height:auto; aspect-ratio:1000 / 560; }
  .compact canvas { aspect-ratio:560 / 610; }
  .sorting canvas { aspect-ratio:1000 / 500; }
  .sorting.compact canvas { aspect-ratio:560 / 510; }
  .film-scene-caption { margin:0 28px; padding:14px 0; border-top:1px solid #303944; color:#c8d2df; font-size:14px; line-height:1.65; }
  .film-controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:12px 28px 0; }
  .film-narration { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; margin:0 28px; padding:12px 0; border-block:1px solid #303944; }
  .film-voice-status { flex:1 1 230px; color:#a9b6c5; font-size:12px; line-height:1.6; }
  button:disabled { opacity:.45; cursor:default; }
  button,select,.film-video { min-height:36px; border:1px solid #3c4857; border-radius:0; background:#202834; padding:7px 12px; color:#d3dfed; font:inherit; font-size:12px; cursor:pointer; text-decoration:none; }
  button:hover,.film-video:hover { border-color:#79b7ff; background:#263545; }
  button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible,summary:focus-visible { outline:2px solid #79b7ff; outline-offset:3px; }
  .film-play { background:#284765; border-color:#527da4; min-width:95px; color:#f3f7fb; }
  .chosen { color:#c2a0fb; border-color:#886cad; }
  .film-speed { display:flex; gap:6px; align-items:center; color:#9dadbf; font-size:11px; }
  .film-speed select { min-width:65px; }
  .film-example { display:grid; gap:5px; color:#98a7ba; font-size:11px; }
  .film-example select { width:clamp(200px,23vw,285px); max-width:100%; }
  .film-time { margin-left:auto; color:#9eadbe; font-size:12px; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .film-video { background:transparent; }
  .film-scrubber { padding:8px 28px 4px; }
  .film-scrubber input { display:block; width:100%; margin:0; min-height:28px; cursor:pointer; accent-color:#79b7ff; }
  .film-chapters { display:flex; flex-wrap:wrap; gap:4px; padding:0 28px 15px; }
  .film-chapters button { min-height:30px; padding:5px 9px; border-color:transparent; background:transparent; font-size:11px; }
  .film-chapters button.chosen { border-bottom-color:#c2a0fb; }
  .film-key { display:flex; flex-wrap:wrap; gap:8px 15px; padding:12px 28px; border-top:1px solid #303944; color:#9aaabd; font-size:10px; }
  .film-key span { display:inline-flex; align-items:center; gap:6px; }
  .film-key i { width:7px; height:7px; }
  .film-bottom { padding:0 28px 20px; }
  .film-note { margin:4px 0 12px; color:#8d9bad; font-size:11px; line-height:1.65; }
  .film-connections { display:flex; gap:8px 20px; flex-wrap:wrap; align-items:center; padding:12px 0; border-top:1px solid #303944; font-size:12px; }
  .film-connections span { color:#8999ae; font-size:10px; }
  .film-connections a { color:#9ac8ff; text-decoration:none; }
  .film-connections a:hover { text-decoration:underline; }
  .film-transcript { border-top:1px solid #303944; color:#99a8bb; font-size:12px; }
  summary { cursor:pointer; padding-top:14px; }
  .film-transcript ol { display:grid; gap:15px; padding-left:23px; }
  .film-transcript button { padding:0; min-height:26px; background:transparent; border:0; color:#c4d9f3; text-align:left; }
  .film-transcript p { margin:4px 0; line-height:1.65; }
  .lesson-player .film-heading { order:0; padding:14px 22px; border-bottom:1px solid #303944; }
  .lesson-player .film-heading h2,.lesson-player .film-label { display:none; }
  .lesson-player .film-heading p { margin:0; max-width:560px; }
  .lesson-player .film-controls { order:1; position:sticky; top:0; z-index:2; padding:10px 22px; background:#19212b; border-bottom:1px solid #354352; }
  .lesson-player .film-scrubber { order:2; padding:0 22px 4px; background:#19212b; }
  .lesson-player .film-stage { order:3; }
  .lesson-player .film-chapters { order:4; }
  .lesson-player .film-key { order:5; }
  .lesson-player .film-bottom { order:6; }
  .visually-hidden { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
  @media(max-width:600px) {
    .film-heading { padding:18px 16px 8px; flex-direction:column; align-items:stretch; }
    .film-controls { padding:10px 16px 0; gap:6px; }
    .film-heading p { font-size:12px; }
    .film-speed { margin-left:auto; }
    .film-time { margin-left:0; }
    .film-scrubber { padding-inline:16px; }
    .film-chapters { padding-inline:16px; gap:2px; }
    .film-key,.film-bottom { padding-inline:16px; }
    .film-scene-caption { margin-inline:16px; }
    .film-narration { margin-inline:16px; }
    button,select,.film-video { min-height:40px; }
    .film-connections { align-items:flex-start; flex-direction:column; }
  }
</style>
