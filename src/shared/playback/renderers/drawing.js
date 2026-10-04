export const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
export const lerp = (a, b, t) => a + (b - a) * t;

export function label(ctx, value, x, y, size, color, align = 'center', weight = 450) {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

export function wrap(ctx, value, x, y, width, size, color, lineHeight = 1.45) {
  ctx.font = `450 ${size}px "Segoe UI", system-ui, sans-serif`;
  const words = value.split(' '),
    lines = [];
  let line = '';
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (ctx.measureText(next).width > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  lines.forEach((line, i) => label(ctx, line, x, y + i * size * lineHeight, size, color, 'left'));
  return lines.length * size * lineHeight;
}

export function fittedLabel(ctx, value, x, y, width, size, color, align = 'left', weight = 550) {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  const fitted = Math.min(size, (size * width) / Math.max(1, ctx.measureText(String(value)).width));
  label(ctx, value, x, y, fitted, color, align, weight);
}
