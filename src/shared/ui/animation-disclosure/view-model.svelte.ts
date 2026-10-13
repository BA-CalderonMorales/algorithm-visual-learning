export function createViewModel() {
  let open = $state(false);
  return {
    get open() {
      return open;
    },
    toggle(event) {
      open = event.currentTarget.open;
    },
  };
}
