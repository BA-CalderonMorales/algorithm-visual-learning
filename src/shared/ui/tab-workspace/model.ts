export function headerOffset() {
  return (
    12 +
    Array.from(document.querySelectorAll('.topbar, .domain-tabs')).reduce(
      (sum, element) => sum + element.getBoundingClientRect().height,
      0,
    )
  );
}
export function revealWorkspace(host: HTMLElement | null) {
  if (!host) return;
  const top = host.getBoundingClientRect().top + window.scrollY - headerOffset();
  if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
}
