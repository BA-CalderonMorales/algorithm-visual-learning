import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, compile } from 'svelte/compiler';

const root = fileURLToPath(new URL('../', import.meta.url));
async function walk(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? walk(`${directory}/${entry.name}`) : `${directory}/${entry.name}`))).flat();
}

// Generated clip metadata is not manually maintained source. Legacy standalone
// walkthroughs in public/ are tested separately, not silently counted as src/.
const generated = new Set(['src/algorithms/play/narration-clips.json']);
const readmes = new Set([
  'src/README.md', 'src/algorithms/README.md',
  'src/discrete/README.md', 'src/complexity/README.md',
]);
const errors = [];
const files = await walk('src');
for (const filename of files) {
  const text = await readFile(path.join(root, filename), 'utf8');
  if (/README\.md$/i.test(filename) && !readmes.has(filename)) errors.push(`${filename}: redundant README`);
  if (/view-model\.ts$/.test(filename)) errors.push(`${filename}: use view-model.svelte.ts, not a parallel VM`);
  if (!/\.(?:svelte|ts|js|css|json)$/.test(filename) || generated.has(filename)) continue;
  const lines = text.replaceAll('\r\n', '\n').trimEnd().split('\n').length;
  if (lines > 500) errors.push(`${filename}: ${lines} physical lines (limit 500)`);
  if (filename.endsWith('.css') && /!important\b/.test(text)) errors.push(`${filename}: undocumented !important`);
  if (!filename.endsWith('.svelte')) continue;
  if (!filename.endsWith('/view.svelte')) errors.push(`${filename}: presentation components use view.svelte`);
  const ast = parse(text);
  if (ast.css) errors.push(`${filename}: move inline styles into the colocated CSS module`);
  const script = ast.instance?.content.body ?? [];
  const styleImports = script.filter(node => node.type === 'ImportDeclaration' && /\.css$/.test(node.source.value));
  if (styleImports.length !== 1 || styleImports[0].source.value !== './view.module.css') {
    errors.push(`${filename}: import exactly one ./view.module.css`);
  }
  for (const node of script) {
    if (node.type === 'ImportDeclaration') continue;
    if (node.type !== 'VariableDeclaration') {
      errors.push(`${filename}: behavior belongs in a view-model or model, not the view script`);
    }
  }
  await access(path.join(root, path.dirname(filename), 'view.module.css'));
  // Compile every presenter so unused styles, accessibility, and invalid Svelte
  // bindings are surfaced here rather than discovered in the browser later.
  const result = compile(text, { filename, generate: false });
  for (const warning of result.warnings) {
    if (warning.code.startsWith('a11y_')) errors.push(`${filename}: ${warning.code}: ${warning.message}`);
  }
}
for (const filename of readmes) assert.ok(files.includes(filename), `Missing ${filename}`);
assert.deepEqual(errors, [], errors.join('\n'));
console.log(`Architecture: ${files.length} source files; 500-line limit, presentation CSS, Svelte compilation, and README ownership passed.`);
