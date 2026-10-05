import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { problemsFlag } from '../src/app/features.ts';
import { approaches, implementations, implementationHref } from '../src/problems/two-pointers/implementations/model.ts';
import { languages } from '../src/shared/ui/code-view/languages.ts';

assert.equal(problemsFlag(undefined, true), true);
assert.equal(problemsFlag(undefined, false), false);
assert.equal(problemsFlag('false', true), false);
assert.equal(problemsFlag('true', false), true);
assert.equal(problemsFlag('typo', false), false);

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
try {
  for (const enabled of [false, true]) {
    const outDir = await mkdtemp(path.join(tmpdir(), 'study-problems-flag-'));
    await build({
        logLevel: 'error',
        define: { 'import.meta.env.VITE_ENABLE_PROBLEMS': JSON.stringify(String(enabled)) },
        build: { outDir, copyPublicDir: false },
    });
    const port = enabled ? 5191 : 5190;
    const server = await preview({ build: { outDir }, preview: { host: '127.0.0.1', port, strictPort: true } });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const base = 'http://127.0.0.1:' + port + '/algorithm-visual-learning/';
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(base + '#/home');
      await page.locator('.library-rows').waitFor();
      assert.equal(await page.locator('.domain-tabs button').filter({ hasText: 'Problems' }).count(), Number(enabled));
      assert.equal(await page.locator('.library-rows a[href="#/problems"]').count(), Number(enabled));
      assert.equal(await page.locator('#navigation-problems').count(), Number(enabled));
      for (const route of ['#/algorithms/sorting/connections', '#/discrete/connections', '#/complexity/connections']) {
        await page.goto(base + route);
        assert.equal(await page.locator('.domain-connections a[href="#/problems"]').count(), Number(enabled));
      }
      await page.keyboard.press('Control+k');
      await page.getByRole('dialog', { name: 'Search the study guide' }).waitFor();
      await page.locator('.site-search input').fill('two sum');
      assert.equal((await page.locator('.site-search a[href^="#/problems"]').count()) > 0, enabled);
      await page.keyboard.press('Escape');
      for (const route of [
        '#/problems',
        '#/problems/two-pointers',
        '#/problems/two-pointers/two-sum/play',
        '#/problems/two-pointers/two-sum/implementations/best/python/simple',
      ]) {
        await page.goto(base + route);
        if (!enabled) await page.waitForURL('**/#/home');
        else await page.getByRole('tablist').first().waitFor();
      }
      if (enabled) {
        for (const [id, definition] of Object.entries(implementations)) {
          for (const approach of approaches)
            for (const language of languages) {
              await page.goto(base + implementationHref(id, approach.id, language.id));
              await page.waitForFunction(
                ({ key, name }) => {
                  const code = document.querySelector('.python-code');
                  return code?.dataset.sourceKey === key && code.textContent.includes(name);
                },
                {
                  key: id + '/' + approach.id + '/' + language.id,
                  name: language.id.startsWith('python') ? definition.pythonName : definition.functionName,
                },
              );
            }
        }
      }
      assert.deepEqual(errors, []);
      console.log(
        'Production Problems flag ' +
          (enabled
            ? 'enabled: 36 implementation routes remain ready.'
            : 'disabled: navigation, search, links and direct routes are hidden.'),
      );
    } finally {
      await page.close();
      await new Promise((resolve) => server.httpServer.close(resolve));
    }
  }
} finally {
  await browser.close();
}
