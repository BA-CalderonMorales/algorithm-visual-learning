import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { themes } from '../src/app/components/appearance/model.ts';
const base = process.env.PLAY_PREVIEW_URL ?? 'http://127.0.0.1:5175';
const out = new URL('../../../outputs/learning-preview/', import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const routes = [
  'algorithms/bubble/play',
  'algorithms/shell/play',
  'algorithms/merge/play',
  'algorithms/tim/play',
  'structures/list-adt/visualize',
  'structures/python-lists/visualize',
  'structures/list-storage/visualize',
  'structures/list-traversal/visualize',
  'structures/list-insertion/visualize',
  'complexity/time/visualize',
  'complexity/space/visualize',
  'complexity/sorting-lower-bound/visualize',
  'discrete/master-theorem/visualize',
  'discrete/induction/visualize',
  'discrete/telescoping/visualize',
  'problems/linked-list',
  'problems/binary-search',
  'problems/sliding-window/fixed-length-sliding-window/play',
  'problems/stack/daily-temperatures/play',
  'problems/prefix-sum/subarray-sum-equals-k/play',
  'problems/breadth-first-search/level-order-sum/play',
  'problems/dynamic-programming/counting-bits/play',
];
async function bounded() {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    false,
    'no horizontal page overflow',
  );
  const bad = await page.locator('.code-workbench svg text').evaluateAll((nodes) =>
    nodes
      .filter((n) => {
        const box = n.getBoundingClientRect(),
          svg = n.ownerSVGElement.getBoundingClientRect();
        return box.left < svg.left - 2 || box.right > svg.right + 2;
      })
      .map((n) => n.textContent),
  );
  assert.deepEqual(bad, [], 'diagram text stays inside viewBox');
}
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`${base}/#/${route}`);
      await page.locator('.code-workbench').waitFor();
      await page.waitForFunction(() => document.querySelector('.code-workbench svg')?.viewBox.baseVal.width > 0);
      await bounded();
      await page
        .getByRole('button', {
          name: route.startsWith('structures/') ? 'Next decision' : 'Next decision →',
          exact: true,
        })
        .click();
      await bounded();
      assert.ok((await page.locator('.code-line[aria-current=step]').count()) > 0);
      if (route.startsWith('structures/')) {
        assert.equal(await page.locator('.current-pointer').count(), 1, `${route} shows its active position`);
        assert.equal(
          await page.locator('.animation-disclosure').count(),
          0,
          `${route} keeps one focused visualization`,
        );
        assert.equal(await page.locator('.workspace.balanced > .state').count(), 1);
        assert.equal(await page.locator('.workspace.balanced > .code').count(), 1);
      }
      if (
        width === 390 &&
        ['algorithms/shell/play', 'structures/list-insertion/visualize', 'discrete/induction/visualize'].includes(route)
      )
        await page.screenshot({
          path: fileURLToPath(new URL(`code-${route.split('/')[0]}-phone.png`, out)),
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/#/algorithms/shell/play`);
  const work = page.locator('.code-workbench');
  await work.getByLabel('Input values', { exact: true }).fill('7, 4, 2, 8, 1');
  await work.getByRole('button', { name: 'Build trace', exact: true }).click();
  await work.getByLabel('Experiment', { exact: true }).selectOption('knuth');
  assert.match(await work.locator('.explanation').innerText(), /4, 1/);
  await work.getByLabel('Predict before advancing', { exact: true }).check();
  assert.equal(await work.getByRole('button', { name: 'Next decision →', exact: true }).isDisabled(), true);
  assert.equal(await work.locator('.code-line[aria-current=step]').count(), 0);
  await work.getByRole('radio').nth(1).check();
  await work.getByRole('button', { name: 'Check prediction', exact: true }).click();
  assert.equal(await work.getByRole('button', { name: 'Next decision →', exact: true }).isDisabled(), true);
  await work.getByRole('radio').nth(0).check();
  await work.getByRole('button', { name: 'Check prediction', exact: true }).click();
  assert.equal(await work.getByRole('button', { name: 'Next decision →', exact: true }).isEnabled(), true);
  await work.getByRole('button', { name: 'Next decision →', exact: true }).click();
  assert.match(await work.locator('.trace-meta').innerText(), /Decision 2/);
  await work.getByLabel('Input values', { exact: true }).fill('<script>alert(1)</script>');
  await work.getByRole('button', { name: 'Build trace', exact: true }).click();
  assert.ok(await work.getByRole('alert').isVisible());
  await work.getByLabel('Input values', { exact: true }).fill('');
  await work.getByRole('button', { name: 'Build trace', exact: true }).click();
  assert.equal(await work.getByRole('alert').count(), 0);
  await work.getByLabel('Predict before advancing', { exact: true }).uncheck();
  while (await work.getByRole('button', { name: 'Next decision →', exact: true }).isEnabled())
    await work.getByRole('button', { name: 'Next decision →', exact: true }).click();
  assert.match(await work.innerText(), /Trace complete/);
  await page.goto(`${base}/#/structures/list-insertion/visualize`);
  await work.getByLabel('Operation', { exact: true }).selectOption('append');
  await work.getByLabel('List type', { exact: true }).selectOption('double');
  while (await work.getByRole('button', { name: 'Next decision', exact: true }).isEnabled())
    await work.getByRole('button', { name: 'Next decision', exact: true }).click();
  assert.match(await work.innerText(), /prev: None/);
  assert.match(await work.locator('.variables').innerText(), /head\s+N0\s+tail\s+X/);
  await work.getByLabel('Input values', { exact: true }).fill('');
  await work.getByRole('button', { name: 'Build trace', exact: true }).click();
  await work.getByLabel('Operation', { exact: true }).selectOption('remove');
  await work.getByRole('button', { name: 'Next decision', exact: true }).click();
  assert.match(await work.innerText(), /Reject removal from an empty list/);
  await page.goto(`${base}/#/structures/list-traversal/visualize`);
  await work.getByLabel('Operation', { exact: true }).selectOption('search');
  while (await work.getByRole('button', { name: 'Next decision', exact: true }).isEnabled())
    await work.getByRole('button', { name: 'Next decision', exact: true }).click();
  assert.match(await work.locator('.state h3').innerText(), /Found 6 at N2/);
  assert.match(await work.locator('.variables').innerText(), /current\s+N2/);
  await work.getByLabel('Input values', { exact: true }).fill('8, 3, 1, 2');
  await work.getByRole('button', { name: 'Build trace', exact: true }).click();
  await work.getByLabel('Operation', { exact: true }).selectOption('search');
  while (await work.getByRole('button', { name: 'Next decision', exact: true }).isEnabled())
    await work.getByRole('button', { name: 'Next decision', exact: true }).click();
  assert.match(await work.locator('.state h3').innerText(), /Target 6 was not found/);
  await page.goto(`${base}/#/discrete/induction/visualize`);
  await work.getByLabel('Experiment', { exact: true }).selectOption('odd');
  for (let i = 0; i < 3; i++) await work.getByRole('button', { name: 'Next decision →', exact: true }).click();
  assert.equal(await work.locator('.cell.active').count(), 7);
  assert.equal(await work.locator('.cell.settled').count(), 9);
  for (const theme of themes) {
    await page.goto(`${base}/#/algorithms/merge/play`);
    await work.getByRole('button', { name: 'Restart trace', exact: true }).click();
    await page.evaluate((id) => (document.documentElement.dataset.theme = id), theme.id);
    for (let i = 0; i < 13; i++) await work.getByRole('button', { name: 'Next decision →', exact: true }).click();
    await bounded();
    if (['paper', 'dark'].includes(theme.id))
      await page.screenshot({ path: fileURLToPath(new URL(`merge-code-${theme.id}.png`, out)), fullPage: true });
  }
  await page.goto(`${base}/#/structures/python-lists/visualize`);
  assert.equal(await page.getByRole('button', { name: 'Next decision', exact: true }).count(), 1);
  await page.getByRole('button', { name: 'Next decision', exact: true }).click();
  assert.match(await page.locator('.current-pointer').innerText(), /Current index/);
  await page.goto(`${base}/#/algorithms/tim/play`);
  while (!(await work.locator('.state h3').innerText()).includes('Insert key'))
    await work.getByRole('button', { name: 'Next decision →', exact: true }).click();
  assert.ok(
    (await work.locator('.code ol').evaluate((e) => e.scrollTop)) > 0,
    'long code panel follows active helper line',
  );
  await page.goto(`${base}/#/algorithms/merge/play`);
  assert.equal(await page.locator('.concept-film').count(), 0, 'closed animation is not mounted');
  await page.getByText('Watch the narrated animation', { exact: true }).click();
  await page.locator('.concept-film').waitFor();
  await page.getByText('Watch the narrated animation', { exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('.concept-film'), 'closing destroys the animation');
  await page.goto(`${base}/#/algorithms/quick/play`);
  assert.equal(await page.locator('.code-workbench').count(), 0);
  assert.ok(
    (await page.locator('.film-player').count()) || (await page.locator('canvas').count()),
    'original Quicksort remains',
  );
  assert.deepEqual(errors, []);
  console.log(
    `Code workbench browser: ${routes.length} routes at desktop/390/320px, ${themes.length} themes, live inputs, prediction gating, empty linked lists, proof cells and helper scrolling passed.`,
  );
} finally {
  await browser.close();
}

