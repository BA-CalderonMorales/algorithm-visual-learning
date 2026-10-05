// Resolve canvas colors from the same ink tokens as the surrounding lesson.
export function chartPalette() {
  const style = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    colors: {
      best: color('--theme-ink-green', '#5de0ac'),
      average: color('--theme-ink-yellow', '#f3bf5f'),
      worst: color('--theme-ink-orange', '#ff896d'),
    },
    text: color('--theme-ink-muted', '#b4bac6'),
    ticks: color('--theme-ink-muted', '#9298a6'),
    grid: color('--theme-chart-grid', '#ffffff12'),
    tooltip: color('--theme-surface-1', '#111318'),
    tooltipText: color('--theme-ink', '#eef0f5'),
  };
}
