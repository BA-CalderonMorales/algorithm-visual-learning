import { onMount } from 'svelte';
import { sceneAt } from '../model.ts';
import { playPalette } from '../renderers/concept.js';
import { renderPlayerFilm } from './renderer.ts';
import { describePlayerScene, narrationStatus, stageBounds } from './model.ts';
import { narratedTime } from '../scene-narration.ts';
import { createRecordedNarration, withNarrationTiming } from '../recorded-narration.ts';

export function createViewModel(props = () => ({})) {
  let {
    film,
    embedded = false,
    lessonPlayer = false,
    variants = [],
    legend = [],
    narration = null,
    sorting = false,
    renderer = renderPlayerFilm,
    sceneDescription = describePlayerScene,
  } = $derived(props());
  let variant = $state('master');
  let examples = $derived(variants.length ? variants : undefined);
  let baseFilm = $derived(examples?.find((v) => v.id === variant)?.film ?? film);
  let isSorting = $derived(sorting);
  let clips = $derived(narration?.clips);
  let voiceAvailable = $derived(isSorting && !embedded && !lessonPlayer && Boolean(clips));
  let selectedFilm = $derived(voiceAvailable && voiceOn && !reverse ? withNarrationTiming(baseFilm, clips) : baseFilm);
  let colorKey = $derived(
    legend.length
      ? legend
      : [
          ['key', 'Held / selected'],
          ['compare', 'Compare'],
          ['shift', 'Shift'],
          ['sorted', 'Completed'],
          ['group', 'Group / pointers'],
        ],
  );
  $effect(() => {
    if (examples && !examples.some((example) => example.id === variant)) variant = examples[0].id;
  });

  let canvas = $state(null);

  let player = $state(null);
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

  let narrator = $state(null);
  let current = $derived(sceneAt(selectedFilm, seconds));
  let scene = $derived(sceneDescription(current.scene, current.index, selectedFilm.frames.length));
  let status = $derived(narrationStatus({ audioSupported, voiceAvailable, voiceStatus, voiceOn, reverse, playing }));
  let stageAspect = $derived(
    `${compact ? 560 : 1000} / ${stageBounds(selectedFilm.id, current.scene, compact).height}`,
  );
  let clipUrl = $derived(`${import.meta.env.BASE_URL}films/${selectedFilm.id}.webm`);
  const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const voiceKey = (index) => `${baseFilm.id}:${clips[index].url}`;
  const sceneStart = (index) => selectedFilm.frames.slice(0, index).reduce((sum, scene) => sum + scene.duration, 0);
  function beginNarration() {
    if (!voiceActive || !narrator) return;
    const position = sceneAt(selectedFilm, seconds);
    narrator.start(voiceKey(position.index), `${import.meta.env.BASE_URL}${clips[position.index].url}`, {
      rate: speed,
    });
  }
  function toggleVoice() {
    const position = sceneAt(selectedFilm, seconds);
    voiceOn = !voiceOn;
    narrator?.stop();
    seconds =
      sceneStart(position.index) +
      (voiceActive ? 0 : Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01));
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
    seconds =
      sceneStart(position.index) +
      (voiceActive ? 0 : Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01));
    if (voiceActive && playing) beginNarration();
  }
  function seek() {
    playing = false;
    narrator?.stop();
  }
  function restart() {
    playing = false;
    jump(reverse ? selectedFilm.duration : 0);
  }
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
  function paint() {
    if (canvas && ready)
      renderer(canvas, selectedFilm, seconds, { compact, reduced: reduced || (lessonPlayer && !playing) });
  }
  function togglePlay() {
    if (playing) {
      playing = false;
      narrator?.pause();
      return;
    }
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
    seconds = time;
    paint();
    if (playing) beginNarration();
  }
  function changeVariant() {
    playing = false;
    seconds = 0;
  }
  function jumpScene(index) {
    playing = false;
    jump(sceneStart(index));
    // A transcript jump should reveal its scene, not leave the diagram above
    // the lesson's viewport. Ordinary playback controls never move the page.
    if (lessonPlayer)
      requestAnimationFrame(() => {
        const scroller = player?.closest('.study-visual-scroll');
        if (scroller) scroller.scrollTop = 0;
      });
  }

  $effect(() => {
    selectedFilm;
    seconds;
    reduced;
    compact;
    playing;
    paint();
  });
  $effect(() => {
    const url = clipUrl;
    let cancelled = false;
    videoAvailable = false;
    fetch(url, { method: 'HEAD' })
      .then((response) => {
        if (!cancelled) videoAvailable = response.ok && response.headers.get('content-type')?.includes('video');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });

  onMount(() => {
    let last = 0,
      animation;
    audioSupported = typeof window.Audio === 'function';
    if (audioSupported)
      narrator = createRecordedNarration(window.Audio, (status) => {
        voiceStatus = status;
        if (status === 'error') {
          const position = sceneAt(selectedFilm, seconds);
          voiceOn = false;
          seconds =
            sceneStart(position.index) + Math.min(position.local, selectedFilm.frames[position.index].duration - 0.01);
        }
      });
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = preference.matches;
    const updatePreference = () => {
      reduced = preference.matches;
      playing = false;
      narrator?.stop();
    };
    preference.addEventListener('change', updatePreference);
    const resize = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      compact = width < 540;
      canvas.width = compact ? 1120 : 1800;
      canvas.height = isSorting ? (compact ? 1020 : 900) : compact ? 1220 : 1008;
      ready = true;
      paint();
    });
    resize.observe(player);
    const hidden = () => {
      if (document.hidden) {
        playing = false;
        narrator?.pause();
      }
    };
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
        if ((seconds === 0 && reverse) || (seconds === selectedFilm.duration && !reverse)) playing = false;
        paint();
      }
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      resize.disconnect();
      document.removeEventListener('visibilitychange', hidden);
      preference.removeEventListener('change', updatePreference);
      narrator?.destroy();
    };
  });
  return {
    get jumpScene() {
      return jumpScene;
    },
    get playPalette() {
      return playPalette;
    },
    get variant() {
      return variant;
    },
    set variant(value) {
      variant = value;
    },
    get examples() {
      return examples;
    },
    get isSorting() {
      return isSorting;
    },
    get clips() {
      return clips;
    },
    get voiceAvailable() {
      return voiceAvailable;
    },
    get selectedFilm() {
      return selectedFilm;
    },
    get colorKey() {
      return colorKey;
    },
    get canvas() {
      return canvas;
    },
    set canvas(value) {
      canvas = value;
    },
    get player() {
      return player;
    },
    set player(value) {
      player = value;
    },
    get seconds() {
      return seconds;
    },
    set seconds(value) {
      seconds = value;
    },
    get playing() {
      return playing;
    },
    set playing(value) {
      playing = value;
    },
    get speed() {
      return speed;
    },
    set speed(value) {
      speed = value;
    },
    get reverse() {
      return reverse;
    },
    set reverse(value) {
      reverse = value;
    },
    get compact() {
      return compact;
    },
    set compact(value) {
      compact = value;
    },
    get videoAvailable() {
      return videoAvailable;
    },
    set videoAvailable(value) {
      videoAvailable = value;
    },
    get voiceOn() {
      return voiceOn;
    },
    set voiceOn(value) {
      voiceOn = value;
    },
    get audioSupported() {
      return audioSupported;
    },
    set audioSupported(value) {
      audioSupported = value;
    },
    get voiceStatus() {
      return voiceStatus;
    },
    set voiceStatus(value) {
      voiceStatus = value;
    },
    get voiceActive() {
      return voiceActive;
    },
    get current() {
      return current;
    },
    get scene() {
      return scene;
    },
    get status() {
      return status;
    },
    get stageAspect() {
      return stageAspect;
    },
    get clipUrl() {
      return clipUrl;
    },
    get formatTime() {
      return formatTime;
    },
    get toggleVoice() {
      return toggleVoice;
    },
    get changeSpeed() {
      return changeSpeed;
    },
    get toggleReverse() {
      return toggleReverse;
    },
    get seek() {
      return seek;
    },
    get restart() {
      return restart;
    },
    get stepScene() {
      return stepScene;
    },
    get replayNarration() {
      return replayNarration;
    },
    get togglePlay() {
      return togglePlay;
    },
    get jump() {
      return jump;
    },
    get changeVariant() {
      return changeVariant;
    },
  };
}
