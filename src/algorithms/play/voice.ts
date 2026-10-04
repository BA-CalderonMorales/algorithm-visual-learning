import recordings from './narration-clips.json';
import { sortingNarration, narrationSource } from './narration.ts';

// Only hand the player clips that still match this exact authored story.
// Audio stays opt-in and is fetched by the player one scene at a time.
export function voiceForFilm(film) {
  const clips = recordings.algorithms[film.id];
  const script = sortingNarration[film.id];
  if (!clips || !script || clips.length !== film.frames.length) return null;
  const valid = clips.every(
    (clip, index) =>
      clip.text === script[index].text && clip.source === narrationSource(film.frames[index]) && clip.duration > 0,
  );
  return valid ? { clips } : null;
}
