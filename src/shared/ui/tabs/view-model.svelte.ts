export function createViewModel(props = () => ({})) {
  let { tabs, selected, orientation = 'horizontal' } = $derived(props());
  function navigate(event, index) {
    const next =
      event.key === (orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight')
        ? (index + 1) % tabs.length
        : event.key === (orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft')
          ? (index + tabs.length - 1) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    event.currentTarget.parentElement.children[next].focus();
    window.location.hash = tabs[next].href;
  }
  return {
    get navigate() {
      return navigate;
    },
  };
}
