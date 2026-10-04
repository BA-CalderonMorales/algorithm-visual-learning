export function createViewModel(props = () => ({})) {
  let { tabs, selected, label, controls = undefined, idPrefix = 'view-tab' } = $derived(props());
  function navigate(event, index) {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
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
