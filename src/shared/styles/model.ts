// CSS values for DOM labels, never canvas/video pixels. Preserve hue meanings.
export function themedColor(hex: string, fill = false) {
  const value = hex.replace('#', '');
  const raw = value.length === 3 ? [...value].map((digit) => digit + digit).join('') : value;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const neutral = delta < 55 || (max < 130 && delta < 45);
  let token;
  if (neutral) {
    if (fill) {
      const level = max <= 25 ? 0 : max <= 38 ? 1 : max <= 64 ? 2 : max <= 78 ? 3 : 4;
      token = `surface-${level}`;
    } else token = max >= 205 ? 'ink' : 'ink-muted';
  } else {
    let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    const name =
      hue < 12 || hue >= 340
        ? 'red'
        : hue < 42
          ? 'orange'
          : hue < 75
            ? 'yellow'
            : hue < 165
              ? 'green'
              : hue < 195
                ? 'teal'
                : hue < 255
                  ? 'blue'
                  : 'purple';
    token = `${fill ? 'fill' : 'ink'}-${name}`;
  }
  return `var(--theme-${token}, ${hex})`;
}
