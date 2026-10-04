export function createViewModel(props = () => ({})) {
  let { comparisons } = $derived(props());
  let activeId = $state('strict-upper');
  let active = $derived(comparisons.find((item) => item.id === activeId) ?? comparisons[0]);
  const width = 720;
  const height = 300;
  const padding = { top: 22, right: 22, bottom: 42, left: 54 };
  const samples = Array.from({ length: 40 }, (_, index) => 1 + index * (99 / 39));
  let ratios = $derived(samples.map((n) => active.f(n) / active.g(n)));
  let maxRatio = $derived(Math.max(...ratios, 0.00001));
  let path = $derived(
    ratios
      .map((ratio, index) => {
        const x = padding.left + (index / (ratios.length - 1)) * (width - padding.left - padding.right);
        const y = padding.top + (1 - ratio / maxRatio) * (height - padding.top - padding.bottom);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' '),
  );
  const chartBottom = height - padding.bottom;
  const chartRight = width - padding.right;
  return {
    get activeId() {
      return activeId;
    },
    set activeId(value) {
      activeId = value;
    },
    get active() {
      return active;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get padding() {
      return padding;
    },
    get maxRatio() {
      return maxRatio;
    },
    get path() {
      return path;
    },
    get chartBottom() {
      return chartBottom;
    },
    get chartRight() {
      return chartRight;
    },
  };
}
