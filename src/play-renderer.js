import { sceneAt } from './play-models.js';
import { ease, lerp, label, wrap } from './play-drawing.js';
import { renderSortingScene } from './sorting-play-renderer.js';

export const playPalette = {
  neutral: '#9aa5b5', key: '#79b7ff', compare: '#f6d774', shift: '#f0a66e',
  sorted: '#65d9b0', group: '#c2a0fb',
};

// Counting needs fixed storage rows: frequencies change meaning, but positions
// never move. Copies follow a bucket to an output slot while the input stays put.
function renderCountingScene(ctx, film, scene, index, local, { compact, reduced, exportVideo }) {
  const state = scene.counting;
  const width = compact ? 560 : 1000, margin = compact ? 28 : 68;
  const left = compact ? margin : 250, right = width - margin;
  const span = right - left, size = compact ? 54 : 64;
  const inputY = compact ? 181 : 168, bucketY = compact ? 299 : 283, outputY = compact ? 414 : 401;
  const itemX = i => left + span * (i + 0.5) / state.input.length;
  const bucketX = v => left + span * (v + 0.5) / state.counts.length;
  const { phase, activeInput: i, activeBucket: v, before, after, target } = state;
  const counting = phase === 'count', prefix = phase === 'prefix', placing = phase === 'place';
  const progress = reduced ? 1 : Math.min(1, local / 1.9);
  const updated = reduced || progress >= (placing ? 0.43 : 0.67);
  const arrived = reduced || progress >= 1;
  const color = playPalette;
  label(ctx, `${String(index + 1).padStart(2, '0')} / ${film.frames.length}     ${scene.chapter.toUpperCase()}`, margin, 28, 14, color.neutral, 'left', 550);
  label(ctx, scene.title, margin, 63, compact ? 24 : 30, '#f0f3f8', 'left', 600);
  const formula = counting ? `input[${i}] = ${v} → bucket[${v}]: ${before} + 1 = ${after}`
    : prefix ? `bucket[${v}]: ${before} + ${state.addend} = ${after} values ≤ ${v}`
    : placing ? `bucket[${v}]: ${before} − 1 = ${target} → output[${target}] = ${v}`
    : phase === 'setup' ? 'n = 6       k = 3 − 0 + 1 = 4 buckets'
    : phase === 'frequencies' ? 'Frequency = how many times a value appears'
    : phase === 'ranges' ? 'Rightmost free slot = bucket[value] − 1'
    : 'Equal values keep their input order. Follow the small i labels.';
  label(ctx, formula, margin, 103, compact ? 15.5 : 19, color.key, 'left', 550);

  const heading = (title, detail, y, tint = color.neutral) => {
    if (compact) label(ctx, `${title} · ${detail}`, margin, y - size / 2 - 17, 18, tint, 'left', 550);
    else {
      label(ctx, title, margin, y - 12, 19, tint, 'left', 600);
      label(ctx, detail, margin, y + 13, 13, color.neutral, 'left');
    }
  };
  heading('Input', '6 items · unchanged', inputY);
  heading('Buckets', ['setup', 'count', 'frequencies', 'done'].includes(phase) ? 'occurrences' : prefix ? 'building totals' : placing ? 'one past last free slot' : 'values ≤ bucket', bucketY, color.group);
  heading('Output', '6 fixed slots', outputY, color.sorted);

  // One visible route explains both the chosen bucket and the destination.
  if (counting || placing) {
    ctx.strokeStyle = color.key + '66'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]); ctx.beginPath();
    ctx.moveTo(itemX(i), inputY + size / 2);
    ctx.lineTo(bucketX(v), bucketY - size / 2);
    if (placing) { ctx.moveTo(bucketX(v), bucketY + size / 2); ctx.lineTo(itemX(target), outputY - size / 2); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  const cell = (x, y, value, role, opacity = 1, origin) => {
    const tint = color[role]; ctx.globalAlpha = opacity;
    ctx.fillStyle = role === 'neutral' ? '#202833' : tint + '22';
    ctx.strokeStyle = tint + (role === 'neutral' ? '55' : 'cc'); ctx.lineWidth = role === 'key' ? 2.3 : 1.3;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    if (value !== null) label(ctx, value, x, y - (origin === undefined ? 0 : 7), compact ? 24 : 29, role === 'neutral' ? '#edf0f6' : tint, 'center', 600);
    if (origin !== undefined) label(ctx, `i=${origin}`, x, y + 16, compact ? 14 : 12, color.neutral);
    ctx.globalAlpha = 1;
  };
  state.input.forEach((value, position) => {
    const active = position === i;
    const processed = counting ? position < i : placing ? position > i : phase === 'done';
    cell(itemX(position), inputY, value.value, active ? 'compare' : 'neutral', processed ? 0.4 : 1);
    label(ctx, active ? `i=${position}` : position, itemX(position), inputY + size / 2 + 15, compact ? 16 : 13, active ? color.compare : color.neutral);
  });
  state.counts.forEach((count, bucket) => {
    const active = bucket === v;
    const number = phase === 'done' ? state.frequency[bucket] : active && !updated ? before : count;
    const role = active ? 'key' : prefix && bucket === v - 1 ? 'group' : 'neutral';
    cell(bucketX(bucket), bucketY, number, role);
    label(ctx, `value ${bucket}`, bucketX(bucket), bucketY + size / 2 + 15, compact ? 16 : 13, active ? color.key : color.group);
  });
  state.output.forEach((value, position) => {
    const destination = placing && position === target;
    const show = value && (!destination || arrived);
    cell(itemX(position), outputY, show ? value.value : null, show ? 'sorted' : destination ? 'key' : 'neutral', 1, show ? value.sourceIndex : undefined);
    label(ctx, position, itemX(position), outputY + size / 2 + 15, compact ? 16 : 13, destination ? color.key : color.neutral);
  });

  if (state.ends) {
    const stride = span / state.input.length;
    state.ends.forEach((end, bucket) => {
      const start = bucket ? state.ends[bucket - 1] : 0;
      const x1 = left + stride * start + 5, x2 = left + stride * end - 5;
      const y = compact ? 468 : 461;
      ctx.strokeStyle = color.group + 'aa'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x1, y - 4); ctx.lineTo(x1, y); ctx.lineTo(x2, y); ctx.lineTo(x2, y - 4); ctx.stroke();
      label(ctx, bucket === 0 ? '0' : bucket === 3 ? '3' : `${bucket}s`, (x1 + x2) / 2, y + 14, compact ? 15 : 12, color.group);
    });
  }
  // The +1 is a tally; the moving value is a copy. Neither removes input data.
  if ((counting || placing) && !reduced && progress > 0.08 && progress < 1) {
    let x, y;
    if (counting) {
      const amount = ease(Math.min(1, (progress - 0.08) / 0.59));
      x = lerp(itemX(i), bucketX(v), amount); y = lerp(inputY, bucketY, amount);
    } else if (progress < 0.43) {
      const amount = ease((progress - 0.08) / 0.35);
      x = lerp(itemX(i), bucketX(v), amount); y = lerp(inputY, bucketY, amount);
    } else {
      const amount = ease((progress - 0.43) / 0.57);
      x = lerp(bucketX(v), itemX(target), amount); y = lerp(bucketY, outputY, amount);
    }
    ctx.fillStyle = '#263c51'; ctx.fillRect(x - 19, y - 19, 38, 38);
    ctx.strokeStyle = color.key; ctx.strokeRect(x - 19, y - 19, 38, 38);
    label(ctx, counting ? '+1' : v, x, y, 22, '#edf6ff', 'center', 650);
  }
  if (exportVideo) {
    const captionY = compact ? 532 : 509;
    ctx.strokeStyle = '#303944'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(margin, captionY - 17); ctx.lineTo(width - margin, captionY - 17); ctx.stroke();
    wrap(ctx, scene.caption, margin, captionY, width - margin * 2, compact ? 16 : 17, '#c8d2df', 1.4);
    label(ctx, 'ALGORITHM VISUAL LEARNING', margin, (compact ? 610 : 560) - 10, 9, '#748496', 'left');
  }
}

// View: one deterministic renderer drives live playback and exported video.
// Seeking never changes algorithm state; all states come from the authored model.
export function renderFilm(canvas, film, seconds, { compact = false, exportVideo = false, reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const width = compact ? 560 : 1000;
  const sorting = ['selection', 'insertion', 'shell', 'quick', 'merge', 'tim', 'counting'].includes(film.id);
  const height = sorting && !exportVideo ? (compact ? 510 : 500) : (compact ? 610 : 560);
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#11151b'; ctx.fillRect(0, 0, width, height);
  const { scene, previous, index, local } = sceneAt(film, seconds);
  if (scene.counting) {
    renderCountingScene(ctx, film, scene, index, local, { compact, reduced, exportVideo });
    return;
  }
  if (sorting) {
    renderSortingScene(ctx, film, scene, previous, index, local, { compact, reduced, exportVideo, palette: playPalette });
    return;
  }
  const isConcept = ['induction', 'telescoping', 'master', 'time', 'space'].some(id => film.id.startsWith(id));
  const amount = reduced ? 1 : ease(Math.min(1, local / 0.9));
  const margin = compact ? 34 : 68;
  const available = width - margin * 2;
  const diagram = { left: margin + available * 0.055, top: compact ? 137 : 122, width: available * 0.89 * (scene.diagramWidth || 1), height: compact ? 260 : 246 };
  const position = token => ({ x: diagram.left + token.x * diagram.width, y: diagram.top + token.y * diagram.height });
  label(ctx, `${String(index + 1).padStart(2, '0')} / ${String(film.frames.length).padStart(2, '0')}     ${scene.chapter.toUpperCase()}`, margin, 37, compact ? 16 : 14, '#9aa5b5', 'left', 550);
  wrap(ctx, scene.title, margin, compact ? 77 : 78, available, compact ? 25 : 32, '#f0f3f8', 1.12);
  const oldTokens = new Map(previous.tokens.map(t => [t.id, t]));
  const currentTokens = new Map(scene.tokens.map(t => [t.id, t]));
  const placements = new Map();
  for (const token of scene.tokens) {
    const old = oldTokens.get(token.id) || token;
    const point = position({ x: lerp(old.x, token.x, amount), y: lerp(old.y, token.y, amount) });
    // A shallow arc distinguishes exchanges without hiding the index baseline.
    if (old.x !== token.x && old.y === token.y && !reduced) point.y -= Math.sin(Math.PI * amount) * (token.role === 'key' ? 42 : 20);
    placements.set(token.id, point);
  }
  ctx.lineWidth = 1.5;
  for (const link of scene.links || []) {
    const from = placements.get(link.from), to = placements.get(link.to);
    if (!from || !to) continue;
    ctx.strokeStyle = playPalette[link.role] + '88';
    ctx.beginPath(); ctx.moveTo(from.x, from.y);
    if (link.curved) ctx.bezierCurveTo(from.x - 45, from.y + 12, to.x + 45, to.y - 12, to.x, to.y);
    else ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  // Shell's active group has a visible path through the actual indices.
  if (scene.group) {
    const points = scene.group.map(i => position({ x: (i + 0.5) / scene.tokens.length, y: 0.42 }));
    ctx.strokeStyle = '#c2a0fb'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y + 65) : ctx.moveTo(p.x, p.y + 65));
    ctx.stroke(); ctx.setLineDash([]);
    label(ctx, `gap ${scene.gap} · indices ${scene.group.join(' → ')}`, width / 2, diagram.top + diagram.height * 0.91, compact ? 14 : 17, playPalette.group);
  }
  const tokenCount = Math.max(5, ...scene.tokens.filter(t => !t.small).map(t => scene.tokens.filter(o => o.y === t.y).length));
  const cell = Math.min(compact ? 58 : 68, diagram.width / tokenCount - 8);
  for (const token of scene.tokens) {
    const p = placements.get(token.id);
    const color = playPalette[token.role] || playPalette.neutral;
    const old = oldTokens.get(token.id);
    ctx.globalAlpha = lerp(old?.opacity ?? (old ? 1 : 0), token.opacity ?? 1, amount);
    const size = token.small ? (token.value === '' ? 15 : Math.min(cell, 34)) : Math.min(cell, token.cellSize ?? cell);
    ctx.fillStyle = token.role === 'neutral' ? '#242c37' : color + '24';
    ctx.strokeStyle = color + (token.role === 'neutral' ? '77' : 'dd');
    ctx.lineWidth = token.role === 'key' ? 2.5 : 1.3;
    ctx.beginPath(); ctx.roundRect(p.x - size / 2, p.y - size / 2, size, size, token.small ? 3 : 2); ctx.fill(); ctx.stroke();
    if (token.fraction) {
      const fontSize = Math.min(25, size * 0.4);
      label(ctx, token.fraction.sign, p.x - size * 0.29, p.y, fontSize, color, 'center', 600);
      const fx = p.x + size * 0.12;
      if (token.fraction.denominator === 1) label(ctx, '1', fx, p.y, fontSize, color, 'center', 600);
      else {
        label(ctx, '1', fx, p.y - size * 0.19, fontSize * 0.85, color);
        label(ctx, token.fraction.denominator, fx, p.y + size * 0.19, fontSize * 0.85, color);
        ctx.strokeStyle = color; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(fx - size * 0.17, p.y); ctx.lineTo(fx + size * 0.17, p.y); ctx.stroke();
      }
    } else if (token.value) {
      let fontSize = token.small ? 17 : Math.min(30, size * 0.48);
      if (isConcept) { ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`; fontSize *= Math.min(1, (size - 6) / ctx.measureText(token.value).width); }
      label(ctx, token.value, p.x, p.y, fontSize, token.role === 'neutral' ? '#edf0f6' : color, 'center', 600);
    }
    if (token.cancelled) { ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(p.x - size / 2, p.y + size / 3); ctx.lineTo(p.x + size / 2, p.y - size / 3); ctx.stroke(); }
    if (token.index !== undefined) label(ctx, token.index, p.x, p.y + size / 2 + 18, compact ? 13 : 14, '#8996a7');
    if (token.pointer) label(ctx, token.pointer, p.x, p.y + size / 2 + 39, compact ? 15 : 16, playPalette.group, 'center', 650);
    if (scene.held === token.value && token.role === 'key') label(ctx, 'held key', p.x, p.y - size / 2 - 17, compact ? 12 : 14, playPalette.key);
  }
  ctx.globalAlpha = 1;
  for (const band of scene.lanes || []) {
    const start = position({ x: band.start, y: band.y }), end = position({ x: band.end, y: band.y });
    const color = playPalette[band.role];
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(start.x + 4, start.y - 6); ctx.lineTo(start.x + 4, start.y); ctx.lineTo(end.x - 4, start.y); ctx.lineTo(end.x - 4, start.y - 6); ctx.stroke();
    label(ctx, band.label, (start.x + end.x) / 2, start.y + 23, compact ? 11 : 15, color);
  }
  for (const annotation of scene.texts || []) {
    const p = position(annotation);
    const old = (previous.texts || []).find(t => t.id === annotation.id && t.text === annotation.text);
    ctx.globalAlpha = reduced || old ? 1 : Math.min(1, local / 0.45);
    const fontSize = (compact ? 20 : 26) * (annotation.size || 1);
    const maxWidth = Math.min(available, Math.max(72, 2 * Math.min(p.x - margin, width - margin - p.x)));
    if (isConcept) {
      ctx.font = `450 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
      const fitted = Math.min(fontSize, fontSize * maxWidth / Math.max(1, ctx.measureText(annotation.text).width));
      if (fitted < 16 && annotation.x === 0.5) wrap(ctx, annotation.text, margin, p.y - 8, available, 17, playPalette[annotation.role], 1.3);
      else label(ctx, annotation.text, p.x, p.y, fitted, playPalette[annotation.role]);
    } else label(ctx, annotation.text, p.x, p.y, fontSize, playPalette[annotation.role]);
  }
  ctx.globalAlpha = 1;
  const captionY = compact ? 441 : 434;
  ctx.strokeStyle = '#303944'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, captionY - 24); ctx.lineTo(width - margin, captionY - 24); ctx.stroke();
  wrap(ctx, scene.caption, margin, captionY, available, compact ? 18 : 19, '#c8d2df');
  if (exportVideo) {
    label(ctx, 'ALGORITHM VISUAL LEARNING', margin, height - 18, 10, '#748496', 'left');
    label(ctx, `${Math.floor(seconds)}s / ${Math.ceil(film.duration)}s`, width - margin, height - 18, 11, '#748496', 'right');
  }
}
