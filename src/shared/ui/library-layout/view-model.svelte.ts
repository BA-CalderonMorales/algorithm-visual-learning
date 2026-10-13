export function createViewModel(props) {
  let panel = $state<HTMLElement | null>(null);
  return {
    get panel() {
      return panel;
    },
    set panel(value) {
      panel = value;
    },
  };
}
