import { sceneAt } from '../../shared/playback/model.ts';
import { ease, lerp, label, fittedLabel } from '../../shared/playback/renderers/drawing.js';
import { playPalette as color } from '../../shared/playback/renderers/concept.js';
import type { PointerState } from './story.ts';

// Same deterministic timeline in forward playback, reverse, and scrubbing.
// Values never glide into different indices: only pointer badges move.
export function renderPointers(canvas, film, seconds, { compact = false, reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const width = compact ? 560 : 1000,
    height = compact ? 296 : 299;
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#11151b';
  ctx.fillRect(0, 0, width, height);
  const { scene, previous, local } = sceneAt(film, seconds);
  const state: PointerState = scene.pointers;
  const old: PointerState = previous.pointers;
  const t = reduced ? 1 : ease(Math.min(1, local / 0.8));
  const margin = compact ? 28 : 70;
  const stride = (width - 2 * margin) / Math.max(1, state.values.length);
  const x = (index: number) => margin + (index + 0.5) * stride;
  const done = state.phase === 'done';
  const active = state.i < state.j && state.i >= 0;
  const indicator = (name: 'i' | 'j' | 'k', index: number, y: number) => {
    if (index < 0 || index >= state.values.length) return;
    const moving = state.phase === 'move' && old[name] != null && old[name] >= 0 && old.k === state.k;
    const px = moving ? lerp(x(old[name]), x(index), t) : x(index);
    ctx.fillStyle = name === 'k' ? color.key + '22' : color.group + '22';
    ctx.strokeStyle = name === 'k' ? color.key : color.group;
    ctx.fillRect(px - 18, y - 14, 36, 28);
    ctx.strokeRect(px - 18, y - 14, 36, 28);
    label(ctx, name, px, y, compact ? 22 : 17, name === 'k' ? color.key : color.group, 'center', 650);
  };

  if (state.kind === 'water') {
    const a = done ? state.bestPair?.[0] : state.i;
    const b = done ? state.bestPair?.[1] : state.j;
    const baseline = 177,
      max = Math.max(1, ...state.values),
      scale = 110 / max;
    if (a != null && b != null && a < b) {
      const level = Math.min(state.values[a], state.values[b]);
      ctx.fillStyle = (done ? color.sorted : color.key) + '28';
      ctx.strokeStyle = done ? color.sorted : color.key;
      ctx.lineWidth = 2;
      ctx.fillRect(x(a), baseline - level * scale, x(b) - x(a), level * scale);
      ctx.strokeRect(x(a), baseline - level * scale, x(b) - x(a), level * scale);
      fittedLabel(
        ctx,
        `${state.phase === 'move' ? 'Next: ' : ''}${b - a} × ${level} = ${(b - a) * level}`,
        width / 2,
        27,
        width - 2 * margin,
        compact ? 22 : 26,
        done ? color.sorted : color.key,
        'center',
      );
    }
    state.values.forEach((value, index) => {
      const selected = index === a || index === b;
      const inside = index >= state.i && index <= state.j;
      ctx.globalAlpha = done ? (selected ? 1 : 0.3) : inside ? 1 : 0.25;
      ctx.strokeStyle = selected ? color.group : color.neutral;
      ctx.lineWidth = selected ? 5 : 2;
      ctx.beginPath();
      ctx.moveTo(x(index), baseline);
      ctx.lineTo(x(index), baseline - value * scale);
      ctx.stroke();
      label(ctx, value, x(index), baseline - value * scale - 15, 20, selected ? color.group : color.neutral);
      label(ctx, index, x(index), 200, compact ? 20 : 15, color.neutral);
    });
    ctx.globalAlpha = 1;
    if (!done) {
      indicator('i', state.i, state.i === state.j ? 249 : 230);
      indicator('j', state.j, state.i === state.j ? 216 : 230);
    }
  } else {
    const size = Math.min(64, stride - 10),
      y = 126;
    const formula = state.original
      ? 'Original input → sort a copy first'
      : active && state.phase !== 'done'
        ? `${state.phase === 'move' ? 'Next: ' : ''}${state.k == null ? '' : `${state.values[state.k]} + `}${state.values[state.i]} + ${state.values[state.j]} = ${state.values[state.i] + state.values[state.j] + (state.k == null ? 0 : state.values[state.k])}`
        : state.kind === 'triple'
          ? `${state.results?.length ?? 0} unique triplets`
          : state.found
            ? 'Pair found'
            : 'No distinct pair remains';
    fittedLabel(ctx, formula, width / 2, 36, width - 2 * margin, compact ? 23 : 28, color.compare, 'center');
    state.values.forEach((value, index) => {
      const endpoint = index === state.i || index === state.j;
      const anchor = index === state.k;
      const inside = state.original || (index >= state.i && index <= state.j) || anchor;
      const tint = anchor ? color.key : state.found && endpoint ? color.sorted : endpoint ? color.group : color.neutral;
      ctx.globalAlpha = inside || (done && state.kind === 'triple') ? 1 : 0.25;
      ctx.fillStyle = tint + '20';
      ctx.strokeStyle = tint;
      ctx.lineWidth = endpoint || anchor ? 2 : 1;
      ctx.fillRect(x(index) - size / 2, y - size / 2, size, size);
      ctx.strokeRect(x(index) - size / 2, y - size / 2, size, size);
      label(ctx, value, x(index), y, Math.min(28, size * 0.45), tint, 'center', 600);
      label(ctx, index, x(index), 181, compact ? 20 : 15, color.neutral);
    });
    ctx.globalAlpha = 1;
    if (!state.original && (!done || state.found)) {
      if (state.k != null) indicator('k', state.k, 218);
      indicator('i', state.i, 218);
      indicator('j', state.j, state.i === state.j ? 251 : 218);
    }
  }
  ctx.globalAlpha = 1;
  const note = state.original
    ? 'The copied array is sorted in the next scene.'
    : state.phase === 'move'
      ? `Move ${state.move}. Values stay in place.`
      : state.phase === 'skip'
        ? 'Skip a repeated choice, not a needed input value.'
        : done
          ? 'Keep the reason for each move, not just the result.'
          : state.kind === 'water'
            ? 'Water level = shorter wall. Width = index distance.'
            : 'Indices are below the values. Pointer labels are below the indices.';
  fittedLabel(ctx, note, width / 2, 280, width - 2 * margin, compact ? 16 : 17, color.neutral, 'center', 450);
}
