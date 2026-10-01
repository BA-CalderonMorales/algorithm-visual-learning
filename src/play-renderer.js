import { sceneAt } from './play-models.js';

export const playPalette = {
  neutral: '#9aa5b5', key: '#79b7ff', compare: '#f6d774', shift: '#f0a66e',
  sorted: '#65d9b0', group: '#c2a0fb',
};
const ease = t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const lerp = (a, b, t) => a + (b - a) * t;

function label(ctx, value, x, y, size, color, align = 'center', weight = 450) {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function wrap(ctx, value, x, y, width, size, color, lineHeight = 1.45) {
  ctx.font = `450 ${size}px "Segoe UI", system-ui, sans-serif`;
  const words = value.split(' '), lines = [];
  let line = '';
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  lines.forEach((line, i) => label(ctx, line, x, y + i * size * lineHeight, size, color, 'left'));
  return lines.length * size * lineHeight;
}

// View: one deterministic renderer drives live playback and exported video.
// Seeking never changes algorithm state; all states come from the authored model.
export function renderFilm(canvas, film, seconds, { compact = false, exportVideo = false, reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  const width = compact ? 560 : 1000, height = compact ? 610 : 560;
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#11151b'; ctx.fillRect(0, 0, width, height);
  const { scene, previous, index, local } = sceneAt(film, seconds);
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
