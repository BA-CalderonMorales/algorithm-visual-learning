import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { algorithms } from '../src/algorithms/model.ts';
import { languages } from '../src/shared/ui/code-view/languages.ts';

// Canonical sources belong to features. Public copies preserve existing URLs;
// never hand-edit these generated compatibility files.
let changed = 0;
for (const algorithm of algorithms) {
  for (const language of languages) {
    const legacyName = language.id === 'python-simple' ? `${algorithm.id}_sort_simple.py`
      : language.id === 'python-typed' ? `${algorithm.id}_sort.py`
      : `${algorithm.id}_sort.${language.id === 'javascript' ? 'js' : 'ts'}`;
    const source = new URL(`../src/algorithms/${algorithm.id}/implementations/${language.file}`, import.meta.url);
    const destination = new URL(`../public/walkthroughs/${legacyName}`, import.meta.url);
    const content = await readFile(source, 'utf8');
    const existing = await readFile(destination, 'utf8').catch(() => null);
    if (process.argv.includes('--check')) assert.equal(existing, content, `${legacyName}: stale compatibility copy; run npm run sync:implementations`);
    else if (existing !== content) { await writeFile(destination, content); changed++; }
  }
}
console.log(process.argv.includes('--check') ? 'All 28 legacy source URLs match their canonical feature sources.' : `Implementation compatibility copies: ${changed} updated.`);
