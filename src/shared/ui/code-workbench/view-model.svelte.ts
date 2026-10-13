import { onMount, tick, untrack } from 'svelte';
import { parseValues } from '../../trace/model.ts';
export function createViewModel(props) {
  let raw = $state(props().definition.input ?? '8, 3, 6, 2, 5');
  let variant = $state(props().definition.variants?.[0]?.id ?? 'default');
  let groupValues = $state(
    (props().definition.variantGroups ?? []).map(
      (group, index) => props().definition.defaultGroups?.[index] ?? group.options[0]?.id ?? '',
    ),
  );
  const selectedVariant = $derived(groupValues.length ? groupValues.join(':') : variant);
  let trace = $state(
    untrack(() => props().definition.build(props().definition.size ? Number(raw) : parseValues(raw), selectedVariant)),
  );
  let index = $state(0);
  let predicting = $state(false);
  let choice = $state<number | null>(null);
  let checked = $state(false);
  let error = $state('');
  let stage = $state<HTMLElement | null>(null);
  let codePanel = $state<HTMLElement | null>(null);
  let columns = $state(4);
  const nodeSpacing = $derived(props().definition.followPointer ? (groupValues[1] === 'double' ? 124 : 108) : 90);
  const nodeTop = props().definition.followPointer ? 58 : 40;
  const current = $derived(trace.scenes[index]);
  const diagramDescription = $derived.by(() => {
    const rows = current.rows
      .map((row) => `${row.label}: ${row.values.length ? row.values.join(', ') : 'empty'}.`)
      .join(' ');
    const nodes = (current.nodes ?? [])
      .map(
        (node) =>
          `${node.id} holds ${node.value}. ${
            (current.links ?? [])
              .filter((link) => link.from === node.id)
              .map((link) => `${link.label} points to ${link.to}`)
              .join('; ') || 'No outgoing links'
          }.`,
      )
      .join(' ');
    const grid = current.grid?.length
      ? `${current.grid.filter((cell) => cell.role === 'settled').length} old units; ${current.grid.filter((cell) => cell.role === 'active').length} added units.`
      : '';
    return `${current.title}. ${current.why} ${nodes} ${rows} ${grid}`;
  });
  $effect(() => {
    const line = current.lines[0];
    if (codePanel && !predicting) {
      tick().then(() => {
        const item = codePanel?.children[line] as HTMLElement;
        if (!item || !codePanel) return;
        const bounds = item.getBoundingClientRect(),
          panelBounds = codePanel.getBoundingClientRect();
        if (bounds.top < panelBounds.top || bounds.bottom > panelBounds.bottom)
          codePanel.scrollTop += bounds.top - panelBounds.top - 20;
      });
    }
  });
  const next = $derived(trace.scenes[index + 1]);
  const choices = $derived.by(() => {
    if (!next) return [];
    if (next.question) return next.question.choices;
    const correct = next.lines[0];
    const alternatives = trace.code
      .map((_, i) => i)
      .filter((i) => i !== correct && trace.code[i].trim() && !trace.code[i].trim().startsWith('#'));
    return [
      correct,
      ...alternatives.slice(
        (index * 2) % Math.max(1, alternatives.length),
        ((index * 2) % Math.max(1, alternatives.length)) + 2,
      ),
      ...alternatives,
    ]
      .slice(0, 3)
      .map((i) => `Line ${i + 1}: ${trace.code[i].trim()}`);
  });
  const offset = $derived(index % 3);
  const options = $derived(choices.map((_, i) => choices[(i + offset) % choices.length]));
  const correct = $derived(choice !== null && options[choice] === choices[0]);
  const rowLayouts = $derived.by(() => {
    let y = current.nodes
      ? Math.ceil(current.nodes.length / columns) * 145 + 80
      : props().definition.followPointer
        ? 80
        : 32;
    return current.rows.map((row) => {
      const maxChars = columns * 10;
      const words = row.label.split(' '),
        labelLines = [''];
      for (const word of words) {
        const last = labelLines.length - 1;
        if (labelLines[last].length + word.length + 1 > maxChars) labelLines.push(word);
        else labelLines[last] += (labelLines[last] ? ' ' : '') + word;
      }
      const extra = (labelLines.length - 1) * 18;
      const result = { ...row, y, labelLines, cellY: y + 18 + extra };
      y += Math.max(1, Math.ceil(row.values.length / columns)) * 82 + 40 + extra;
      return result;
    });
  });
  const nodeLayouts = $derived(
    (current.nodes ?? []).map((node, i) => ({
      ...node,
      x: 28 + (i % columns) * nodeSpacing,
      y: nodeTop + Math.floor(i / columns) * 145,
    })),
  );
  const activePointer = $derived.by(() => {
    const node = nodeLayouts.find((item) => item.active);
    if (node) return { x: node.x + 36, y: node.y - 24, label: 'Current node', id: node.id };
    if (!props().definition.followPointer) return null;
    for (const row of rowLayouts) {
      const index = row.active?.[0];
      if (index !== undefined)
        return {
          x: 59 + (index % columns) * 90,
          y: row.cellY + Math.floor(index / columns) * 82 - 28,
          label: 'Current index',
          id: String(index),
        };
    }
    return null;
  });
  const width = $derived(columns * nodeSpacing + 40);
  const height = $derived(
    current.grid?.length
      ? (Math.max(...current.grid.map((c) => c.row)) + 1) * 38 + 40
      : rowLayouts.length
        ? rowLayouts.at(-1).cellY + Math.max(1, Math.ceil(rowLayouts.at(-1).values.length / columns)) * 82 + 30
        : current.nodes?.length
          ? Math.ceil(current.nodes.length / columns) * 145 + 45
          : 100,
  );
  const edges = $derived(
    (current.links ?? [])
      .map((link, i) => {
        const a = nodeLayouts.find((node) => node.id === link.from),
          b = nodeLayouts.find((node) => node.id === link.to);
        if (!a || !b) return null;
        const back = link.label === 'prev';
        const x1 = a.x + 36,
          y1 = a.y + (back ? 76 : 88),
          x2 = b.x + 36,
          y2 = b.y + (back ? 76 : 88);
        return {
          ...link,
          d: `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) + (back ? -45 : 50)} ${x2} ${y2}`,
          x: (x1 + x2) / 2,
          y: Math.min(y1, y2) + (back ? -23 : 28),
        };
      })
      .filter(Boolean),
  );
  function run() {
    try {
      const input = props().definition.size ? Number(raw) : parseValues(raw);
      if (props().definition.size && (!Number.isInteger(input) || input < 1 || input > 8))
        throw new Error('Choose an integer size from 1 to 8.');
      trace = props().definition.build(input, selectedVariant);
      index = 0;
      choice = null;
      checked = false;
      error = '';
    } catch (e) {
      error = e.message;
    }
  }
  function resetAnswer() {
    choice = null;
    checked = false;
  }
  onMount(() => {
    let resizeFrame = 0;
    const observer = new ResizeObserver((entries) => {
      const nextColumns = Math.max(2, Math.min(8, Math.floor(entries[0].contentRect.width / nodeSpacing)));
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        columns = nextColumns;
      });
    });
    if (stage) observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
    };
  });
  return {
    get diagramDescription() {
      return diagramDescription;
    },
    get codePanel() {
      return codePanel;
    },
    set codePanel(value) {
      codePanel = value;
    },
    get raw() {
      return raw;
    },
    set raw(v) {
      raw = v;
    },
    get variant() {
      return variant;
    },
    set variant(v) {
      variant = v;
    },
    get groupValues() {
      return groupValues;
    },
    setGroup(index, value) {
      groupValues[index] = value;
      run();
    },
    get trace() {
      return trace;
    },
    get current() {
      return current;
    },
    get next() {
      return next;
    },
    get index() {
      return index;
    },
    get predicting() {
      return predicting;
    },
    set predicting(v) {
      predicting = v;
      resetAnswer();
    },
    get choice() {
      return choice;
    },
    get checked() {
      return checked;
    },
    get correct() {
      return correct;
    },
    get options() {
      return options;
    },
    get error() {
      return error;
    },
    get stage() {
      return stage;
    },
    set stage(v) {
      stage = v;
    },
    get columns() {
      return columns;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    get rows() {
      return rowLayouts;
    },
    get nodes() {
      return nodeLayouts;
    },
    get activePointer() {
      return activePointer;
    },
    get edges() {
      return edges;
    },
    wrapValue(value) {
      const text = String(value);
      if (text.length <= 10) return [text];
      const split = text.lastIndexOf(' ', 10);
      return split > 0 ? [text.slice(0, split), text.slice(split + 1)] : [text.slice(0, 10), text.slice(10)];
    },
    run,
    choose(i) {
      choice = i;
      checked = false;
    },
    check() {
      if (choice !== null) checked = true;
    },
    move(delta) {
      if (delta > 0 && predicting && (!checked || !correct)) return;
      index = Math.max(0, Math.min(trace.scenes.length - 1, index + delta));
      resetAnswer();
    },
    restart() {
      index = 0;
      resetAnswer();
    },
  };
}
