import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { assertSharpCorners } from './assert-sharp-corners.mjs';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const errors = [];
try {
  for (const width of [1920, 1440, 1024, 900, 844, 768, 600, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width === 844 ? 390 : 900 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin + '/#/home');
    const github = page.getByRole('link', { name: 'View the project on GitHub', exact: true });
    assert.equal(await github.locator('svg').count(), 1);
    assert.equal((await github.innerText()).trim(), '');
    assert.match(await github.getAttribute('title'), /source and contribute/);
    assert.equal(await github.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(await github.evaluate((el) => el.previousElementSibling.matches('.width-toggle')), true);

    const picker = page.getByRole('button', { name: 'Choose theme', exact: true });
    const assertControlOrder = async () => {
      const search = await page.getByRole('button', { name: 'Search topics (Ctrl+K)', exact: true }).boundingBox();
      const theme = await picker.boundingBox();
      const fullscreen = await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).boundingBox();
      assert.ok(search.x + search.width <= theme.x, 'Theme control stays to the right of search');
      assert.ok(theme.x + theme.width <= fullscreen.x, 'Fullscreen stays to the right of the theme control');
    };
    await assertControlOrder();
    const rootTheme = () => page.locator('html').getAttribute('data-theme');
    const surface = () => page.locator('.library-workspace').evaluate((el) => getComputedStyle(el).backgroundColor);
    const originalSurface = await surface();
    const accent = await page.locator('html').evaluate((el) => getComputedStyle(el).getPropertyValue('--blue'));
    const surfaces = [];
    for (const name of ['Midnight', 'Warm', 'Paper', 'Dawn', 'Dark']) {
      await picker.click();
      const menu = page.getByRole('menu', { name: 'Study theme', exact: true });
      assert.equal(await menu.locator('.theme-check').count(), 1, 'Only the selected theme is checked');
      assert.ok(
        await menu.locator('[aria-checked="true"] .theme-check').evaluate((el) => {
          const check = el.getBoundingClientRect();
          const square = el.closest('.theme-swatch').getBoundingClientRect();
          return (
            check.left >= square.left &&
            check.right <= square.right &&
            check.top >= square.top &&
            check.bottom <= square.bottom &&
            Math.abs(check.left + check.width / 2 - square.left - square.width / 2) < 1 &&
            Math.abs(check.top + check.height / 2 - square.top - square.height / 2) < 1
          );
        }),
        'The selection check is centered inside its square',
      );
      const box = await menu.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width, 'Theme picker stays inside viewport');
      await page.getByRole('menuitemradio', { name: new RegExp(name) }).click();
      assert.equal(await rootTheme(), name.toLowerCase());
      assert.equal(await picker.getAttribute('aria-expanded'), 'false');
      assert.equal(await picker.evaluate((el) => document.activeElement === el), true);
      surfaces.push(await surface());
      if (!['Paper', 'Dawn'].includes(name)) {
        assert.equal(
          await page.locator('html').evaluate((el) => getComputedStyle(el).getPropertyValue('--blue')),
          accent,
        );
      }
      await assertSharpCorners(page);
    }
    assert.equal(new Set(surfaces).size, 5, 'Each theme has distinct surfaces');
    assert.equal(surfaces[4], originalSurface, 'Dark preserves the original palette');

    await picker.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await rootTheme(), 'midnight');
    await picker.click();
    await page.keyboard.press('Escape');
    assert.equal(await picker.getAttribute('aria-expanded'), 'false');
    assert.equal(await picker.evaluate((el) => document.activeElement === el), true);
    await picker.click();
    await page.locator('.intro-heading').click({ position: { x: 5, y: 5 } });
    assert.equal(await picker.getAttribute('aria-expanded'), 'false');
    const full = page.getByRole('button', { name: 'Expand to full width', exact: true });
    const previousWidth = await page.locator('main').evaluate((el) => el.clientWidth);
    await full.click();
    assert.equal(await page.locator('html').getAttribute('data-width'), 'full');
    assert.equal(
      await page.getByRole('button', { name: 'Use reading width', exact: true }).getAttribute('aria-pressed'),
      'true',
    );
    if (width >= 1440) {
      assert.ok((await page.locator('main').evaluate((el) => el.clientWidth)) > previousWidth);
    }
    await page.reload();
    assert.equal(await rootTheme(), 'midnight', 'Theme persists across reloads');
    assert.equal(await page.locator('html').getAttribute('data-width'), 'full');
    await page.getByRole('button', { name: 'Use reading width', exact: true }).click();
    assert.equal(await page.locator('main').evaluate((el) => el.clientWidth), previousWidth);

    for (const route of [
      '#/home',
      '#/algorithms/sorting',
      '#/discrete/telescoping/understand',
      '#/complexity/asymptotic/visualize',
      '#/problems/two-pointers/two-sum/implementations/brute/python/simple',
    ]) {
      await page.goto(origin + '/' + route);
      assert.equal(await rootTheme(), 'midnight');
      await assertControlOrder();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      assert.ok(
        await page
          .locator('.topbar-leading')
          .evaluate(
            (el) =>
              el.getBoundingClientRect().right <=
              el.parentElement.querySelector('.topbar-actions').getBoundingClientRect().left,
          ),
      );
      const show = page.getByRole('button', { name: 'Show intro', exact: true });
      const position = await show.boundingBox();
      await show.click();
      const hide = page.getByRole('button', { name: 'Hide intro', exact: true });
      assert.deepEqual(await hide.boundingBox(), position, 'Eye stays anchored');
      assert.ok(
        await page
          .locator('.intro-body')
          .evaluate(
            (el) =>
              el.getBoundingClientRect().top <=
              el.parentElement.querySelector('.intro-control').getBoundingClientRect().bottom,
          ),
        'Expanded content starts beside the eye, not below a control row',
      );
      await hide.click();
    }
    await page.goto(origin + '/#/home');
    await page.screenshot({ path: 'screenshots/appearance-' + width + '.png' });
    await page.close();
    console.log('Theme selection, persistence, header order, width and intro placement passed at ' + width + 'px.');
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const id of ['selection', 'insertion', 'shell', 'merge', 'quick', 'tim', 'counting']) {
    await page.goto(origin + '/#/algorithms/' + id + '/walkthrough');
    await page.waitForFunction(
      () => document.querySelector('.walkthrough-host')?.getAttribute('aria-busy') === 'false',
    );
    assert.equal(await page.getByRole('alert').count(), 0);
    const frame = page.frameLocator('iframe');
    for (const theme of ['Midnight', 'Warm', 'Paper', 'Dawn', 'Dark']) {
      await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
      await page.getByRole('menuitemradio', { name: new RegExp(theme) }).click();
      await frame.locator('html[data-theme="' + theme.toLowerCase() + '"]').waitFor();
    }
    const next = frame.getByRole('button', { name: /Next step/i });
    await next.click();
    console.log(id + ': iframe theme sync and Next step passed.');
  }
  await page.close();

  const blocked = await browser.newPage();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  blocked.on('pageerror', (error) => errors.push(error.message));
  await blocked.goto(origin + '/#/home');
  await blocked.getByRole('button', { name: 'Choose theme', exact: true }).click();
  await blocked.getByRole('menuitemradio', { name: /Warm/ }).click();
  assert.equal(await blocked.locator('html').getAttribute('data-theme'), 'warm');
  await blocked.close();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
