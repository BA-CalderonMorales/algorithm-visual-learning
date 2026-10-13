import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { studyLessons, lessonTabs, lessonHref } from '../src/app/study-catalog.ts';
import { catalogLessons, patterns, catalogHref, catalogProblemTabs } from '../src/problems/catalog/model.ts';
import { lessons as pointerLessons } from '../src/problems/two-pointers/lessons.ts';
import { algorithms } from '../src/algorithms/model.ts';
const cases = [];
for (const domain of ['discrete', 'complexity', 'structures', 'algorithms/sorting', 'problems'])
  for (const view of ['', '/connections']) cases.push({ href: `#/${domain}${view}` });
for (const pattern of patterns) for (const view of ['', '/connections']) cases.push({ href: pattern.href + view });
for (const lesson of Object.values(studyLessons))
  for (const tab of lessonTabs) cases.push({ href: lessonHref(lesson, tab.id), kind: 'study', view: tab.id, lesson });
for (const lesson of catalogLessons)
  for (const view of catalogProblemTabs) cases.push({ href: catalogHref(lesson, view), kind: 'catalog', view, lesson });
for (const lesson of pointerLessons)
  for (const view of ['understand', 'play', 'practice', 'implementations/best/python/simple'])
    cases.push({ href: `#/problems/two-pointers/${lesson.id}/${view}`, kind: 'pointers', view, lesson });
for (const algorithm of algorithms)
  for (const view of ['understand', 'play', 'walkthrough', 'practice', 'complexity', 'growth', 'python/simple'])
    cases.push({ href: `#/algorithms/${algorithm.id}/${view}` });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let count = 0;
try {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const item of cases) {
      await page.goto(`http://127.0.0.1:5176/algorithm-visual-learning/${item.href}`);
      await page.locator('.section-toggle').first().waitFor();
      const text = await page.locator('main').innerText();
      assert.ok(text.trim().length > 30, `Empty route ${item.href}`);
      assert.ok(
        !text.includes('One idea across subjects') &&
          !text.includes('Connect what you learn.') &&
          !text.includes('Original study explanations and visuals.'),
        `Repeated filler: ${item.href}`,
      );
      if (item.kind === 'catalog' && item.view === 'understand')
        for (const field of ['invariant', 'example', 'time', 'space', 'trap'])
          assert.ok(text.includes(item.lesson[field]), `Lost ${field}: ${item.href}`);
      if (item.kind === 'study' && item.view === 'understand')
        for (const field of ['question', 'idea', 'caution'])
          assert.ok(text.includes(item.lesson[field]), `Lost ${field}: ${item.href}`);
      if (item.kind === 'pointers' && item.view === 'understand')
        for (const field of ['task', 'precondition', 'proof', 'trap', 'cost'])
          assert.ok(text.includes(item.lesson[field]), `Lost ${field}: ${item.href}`);
      if (item.kind === 'catalog' && item.view === 'practice') assert.equal(await page.getByRole('radio').count(), 3);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `Overflow ${width} ${item.href}`,
      );
      count++;
      if (count % 100 === 0) console.log(`${count} pages checked`);
    }
    console.log(`${cases.length} routes checked at ${width}px`);
  }
  assert.deepEqual(errors, []);
  await mkdir('../../outputs/minimalism-preview', { recursive: true });
  for (const [name, href] of [
    ['discrete', '#/discrete'],
    ['two-sum', '#/problems/two-pointers/two-sum/understand'],
    ['practice', '#/complexity/time/practice'],
    ['connections', '#/structures/connections'],
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`http://127.0.0.1:5176/algorithm-visual-learning/${href}`);
    await page.locator('.section-toggle').first().waitFor();
    await page.screenshot({ path: `../../outputs/minimalism-preview/${name}.png`, fullPage: true });
  }
  console.log(
    `PASS: ${cases.length} distinct routes, ${count} page checks; examples, pitfalls, assumptions and practice controls retained.`,
  );
} finally {
  await browser.close();
}
