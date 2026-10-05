import { film, frame } from '../../shared/playback/model.ts';

export interface PointerState {
  kind: 'sum' | 'water' | 'triple';
  values: number[];
  i: number;
  j: number;
  k?: number;
  target?: number;
  best?: number;
  bestPair?: number[];
  results?: number[][];
  phase: 'setup' | 'check' | 'move' | 'anchor' | 'skip' | 'done';
  move?: 'i' | 'j' | 'both';
  found?: boolean;
  original?: boolean;
}

export function scene(chapter: string, title: string, caption: string, state: PointerState) {
  return frame(chapter, title, caption, [], {
    pointers: { ...state, values: [...state.values], results: state.results?.map((answer) => [...answer]) },
  });
}

export function pointerFilm(id: string, title: string, frames, connection: string) {
  return film(
    id,
    title,
    'Move only after you can explain what is safe to discard.',
    frames,
    [{ title: 'Return to the reasoning', href: connection }],
    'Original teaching animation. Array indices are zero-based. No values move during the pointer scan.',
  );
}

export const pointerLegends = {
  'two-sum': [
    ['group', 'i / j boundaries'],
    ['sorted', 'Found pair'],
  ],
  container: [
    ['group', 'i / j walls'],
    ['key', 'Water level'],
    ['sorted', 'Best rectangle'],
  ],
  'three-sum': [
    ['group', 'i / j boundaries'],
    ['key', 'Fixed k'],
    ['sorted', 'Matched pair'],
  ],
};

export function describeScene(scene, index: number, count: number) {
  const state: PointerState = scene.pointers;
  return {
    phase: scene.chapter,
    progress: `${index + 1} / ${count}`,
    boundary:
      state.kind === 'water'
        ? `Best area: ${state.best ?? 0}${state.bestPair?.length ? ` · walls ${state.bestPair.join(' and ')}` : ''}`
        : state.kind === 'triple'
          ? `Unique triplets: ${state.results?.map((answer) => `[${answer.join(', ')}]`).join(' · ') || 'none yet'}`
          : `Target: ${state.target} · distinct indices only`,
    facts: [],
  };
}
