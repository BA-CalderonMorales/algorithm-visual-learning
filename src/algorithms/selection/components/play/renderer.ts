import { sceneAt } from '../../../../shared/playback/model.ts';
import { ease, lerp, label, fittedLabel } from '../../../../shared/playback/renderers/drawing.js';
import { playPalette } from '../../../../shared/playback/renderers/concept.js';

// Selection's diagram adapter uses the shared player chrome. Scene IDs, timing,
// recordings and exported films stay intact.
export function renderSelection(canvas, film, seconds, { compact, reduced }) {
  const ctx = canvas.getContext('2d');
  const { scene, previous, local } = sceneAt(film, seconds);
  const width = compact ? 560 : 1000;
  const height = compact ? 280 : 260;
  const margin = compact ? 30 : 70;
  const span = width - margin * 2;
  const stride = span / scene.tokens.length;
  const size = compact ? 64 : 76;
  const y = compact ? 110 : 91;
  const x = (position) => margin + stride * (position + 0.5);
  const amount = reduced ? 1 : ease(Math.min(1, local / 1.65));
  const oldSlots = new Map(previous.tokens.map((token, position) => [token.id, position]));
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const tile = (px, py, value, role = 'neutral') => {
    const tint = playPalette[role];
    ctx.fillStyle = role === 'neutral' ? '#202833' : tint + '22';
    ctx.strokeStyle = role === 'neutral' ? '#47505d' : tint;
    ctx.lineWidth = role === 'key' ? 2 : 1;
    ctx.fillRect(px - size / 2, py - size / 2, size, size);
    ctx.strokeRect(px - size / 2, py - size / 2, size, size);
    if (value !== null) label(ctx, value, px, py, 30, role === 'neutral' ? '#edf0f6' : tint, 'center', 600);
  };
  scene.tokens.forEach((_, position) => tile(x(position), y, null));
  scene.tokens.forEach((token, position) => {
    const old = oldSlots.get(token.id) ?? position;
    const moving = old !== position && amount < 1;
    const lift = Math.sin(Math.PI * amount) * (old < position ? -1 : 1) * 33;
    tile(lerp(x(old), x(position), amount), y + (moving ? lift : 0), token.value, moving ? 'shift' : token.role);
  });
  scene.tokens.forEach((token, position) => {
    label(ctx, position, x(position), y + size / 2 + 22, 16, playPalette.neutral);
    if (token.pointer) label(ctx, token.pointer, x(position), y + size / 2 + 46, 18, playPalette.group, 'center', 650);
  });
  let prefix = 0;
  while (scene.tokens[prefix]?.role === 'sorted') prefix++;
  const bandY = compact ? 231 : 209;
  const band = (start, end, text, color) => {
    const left = margin + stride * start + 4;
    const right = margin + stride * end - 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, bandY - 6);
    ctx.lineTo(left, bandY);
    ctx.lineTo(right, bandY);
    ctx.lineTo(right, bandY - 6);
    ctx.stroke();
    fittedLabel(ctx, text, (left + right) / 2, bandY + 21, right - left, compact ? 17 : 16, color, 'center');
  };
  if (prefix) band(0, prefix, 'Fixed', playPalette.sorted);
  if (prefix < scene.tokens.length) band(prefix, scene.tokens.length, 'Still to scan', playPalette.neutral);
}
