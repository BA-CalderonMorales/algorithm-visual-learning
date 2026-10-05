import themeCss from '../../../shared/styles/themes.css?raw';

// Walkthroughs are separate same-origin documents; root CSS cannot reach them.
export function connectWalkthroughTheme(doc: Document) {
  let sheet = doc.querySelector<HTMLStyleElement>('#study-theme');
  if (!sheet) {
    sheet = doc.createElement('style');
    sheet.id = 'study-theme';
    sheet.textContent = themeCss;
    doc.head.append(sheet);
  }
  const sync = () => {
    doc.documentElement.dataset.theme = document.documentElement.dataset.theme || 'dark';
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
