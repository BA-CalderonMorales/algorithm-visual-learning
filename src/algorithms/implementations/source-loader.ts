import { languageFor } from '../../shared/ui/code-view/languages.ts';
const sources = import.meta.glob<string>('../*/implementations/*.{py,js,ts}', { query: '?raw', import: 'default' });
export async function loadAlgorithmSource(key: string) {
  const [id, language] = key.split('/');
  const load = sources[`../${id}/implementations/${languageFor(language).file}`];
  if (!load) throw new Error('This algorithm implementation is not available.');
  return load();
}
