export const languages = [
  {
    id: 'python-simple',
    label: 'Python (simple)',
    path: 'python/simple',
    file: 'python-simple.py',
    description: 'Python · intuition-first',
  },
  {
    id: 'python-typed',
    label: 'Python (typed)',
    path: 'python/typed',
    file: 'python-typed.py',
    description: 'Python · typed reference',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    path: 'javascript',
    file: 'javascript.js',
    description: 'JavaScript · implementation',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    path: 'typescript',
    file: 'typescript.ts',
    description: 'TypeScript · typed implementation',
  },
];
export function languageFor(id: string) {
  return languages.find((language) => language.id === id) ?? languages[0];
}
