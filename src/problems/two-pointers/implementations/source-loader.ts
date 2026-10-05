import { languageFor } from '../../../shared/ui/code-view/languages.ts';
const sources = import.meta.glob<string>('../*/implementations/*/*.{py,js,ts}', { query: '?raw', import: 'default' });
export async function loadProblemSource(key: string) {
  const [id, approach, language] = key.split('/');
  const load = sources[`../${id}/implementations/${approach}/${languageFor(language).file}`];
  if (!load) throw new Error('This problem implementation is not available.');
  return load();
}
