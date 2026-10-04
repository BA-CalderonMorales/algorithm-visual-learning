import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import {
  navigationGroups,
  readingOrder,
  readingLinksFor,
  breadcrumbsFor,
} from '../src/app/components/navigation/model.ts';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const drawer = page.locator('#study-navigation');
const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
async function open() {
  await toggle.click();
  await page.waitForFunction(() => document.querySelector('#study-navigation').contains(document.activeElement));
}
async function close() {
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.matches('.nav-toggle'));
  assert.equal(await drawer.getAttribute('inert'), '');
  assert.equal(await page.locator('.content-column').getAttribute('inert'), null);
}

try {
  // Breadcrumbs and page-turn links share the same ordered topic registry.
  for (const [index, item] of readingOrder.entries()) {
    const location = {
      domain: item.domain,
      topic: item.key,
      selectedAlgorithm: item.domain === 'algorithms' && item.key !== 'catalog' ? { id: item.key } : undefined,
    };
    const links = readingLinksFor(location);
    assert.equal(links.previous?.href, readingOrder[index - 1]?.href);
    assert.equal(links.next?.href, readingOrder[index + 1]?.href);
    assert.ok(breadcrumbsFor(location).at(-1)?.label);
  }
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 900, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    for (const group of navigationGroups) {
      for (const link of [group.overview, ...group.topics]) {
        await page.goto(`${origin}/${link.href}`);
        await page.locator('main').waitFor();
        await open();
        assert.equal(
          await drawer.locator(`[aria-controls="navigation-${group.id}"]`).getAttribute('aria-expanded'),
          'true',
        );
        assert.equal(await drawer.locator('a[aria-current="page"]').getAttribute('href'), link.href);
        assert.equal(await drawer.locator('a[aria-current="page"]').count(), 1);
        assert.equal(
          await drawer.locator('.topic-link').count(),
          navigationGroups.reduce((total, group) => total + group.topics.length, 0),
          'All registry topics have real links',
        );
        assert.ok(
          await drawer.locator('a[aria-current="page"]').evaluate((el) => {
            const box = el.getBoundingClientRect();
            const nav = el.closest('nav').getBoundingClientRect();
            return box.top >= nav.top - 1 && box.bottom <= nav.bottom + 1;
          }),
          `Current link is visible: ${link.href} at ${viewport.width}px`,
        );
        assert.ok(await drawer.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'No drawer horizontal overflow');
        assert.ok(
          await drawer.locator('.sidebar-footer').evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
          'Footer remains reachable',
        );
        await close();
      }
    }

    await page.goto(`${origin}/#/discrete/induction/practice`);
    await open();
    const math = drawer.locator('[aria-controls="navigation-discrete"]');
    await math.click();
    assert.equal(await drawer.locator('#navigation-discrete').isVisible(), false);
    await close();
    await page.getByRole('tab', { name: 'Understand', exact: true }).click();
    await open();
    assert.equal(await math.getAttribute('aria-expanded'), 'false', 'Tab switching preserves disclosure choice');
    await math.click();
    await drawer.getByRole('link', { name: 'Telescoping sums', exact: true }).click();
    await page.waitForURL('**/#/discrete/telescoping/understand');
    assert.equal(await drawer.getAttribute('aria-hidden'), 'true', 'Topic links close the drawer');
    await open();
    for (const group of navigationGroups) {
      const disclosure = drawer.locator(`[aria-controls="navigation-${group.id}"]`);
      if ((await disclosure.getAttribute('aria-expanded')) === 'false') await disclosure.click();
    }
    assert.ok(
      await drawer.locator('.navigation-scroll').evaluate((el) => {
        const footer = el.parentElement.querySelector('.sidebar-footer').getBoundingClientRect();
        return el.getBoundingClientRect().bottom <= footer.top && el.scrollWidth <= el.clientWidth + 1;
      }),
      'Expanded groups scroll independently without colliding with the footer',
    );
    await drawer.getByRole('link', { name: 'Contribute to the guide', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement.classList.contains('brand')),
      true,
      'Focus wraps inside drawer',
    );
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('contribute-link')), true);
    await page.keyboard.press('Control+k');
    await page.getByRole('dialog', { name: 'Search the study guide' }).waitFor();
    assert.equal(await drawer.getAttribute('aria-hidden'), 'true', 'Search and navigation never stack');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'Body scroll restored');
    console.log(
      `Navigation: all 16 domain/topic links, disclosures, focus and overflow passed at ${viewport.width}×${viewport.height}.`,
    );
  }

  await mkdir(new URL('../screenshots/', import.meta.url), { recursive: true });
  for (const width of [1440, 900, 700, 460, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      '#/home/resources',
      '#/algorithms/tim/understand',
      '#/discrete/master-theorem/understand',
      '#/complexity/asymptotic/understand',
    ]) {
      await page.goto(`${origin}/${route}`);
      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb', exact: true });
      assert.equal(await crumbs.locator('[aria-current="page"]').count(), 1);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
        `Header overflow: ${route} at ${width}px`,
      );
      assert.ok(
        await page
          .locator('.topbar-leading')
          .evaluate(
            (el) =>
              el.getBoundingClientRect().right <=
              el.parentElement.querySelector('.topbar-actions').getBoundingClientRect().left,
          ),
        'Breadcrumbs and actions never overlap',
      );
      const show = page.getByRole('button', { name: 'Show intro', exact: true });
      await show.hover();
      assert.equal(await show.locator('svg').count(), 1);
      assert.equal(await show.locator('.intro-tooltip').evaluate((el) => getComputedStyle(el).opacity), '1');
      assert.ok(
        await page.locator('.hero-collapsed-strip').evaluate((el) => {
          const title = el.querySelector('span').getBoundingClientRect();
          const button = el.querySelector('button').getBoundingClientRect();
          return Math.abs(title.top + title.height / 2 - button.top - button.height / 2) < 1;
        }),
        'Intro title and eye icon are vertically aligned',
      );
      await show.click();
      await page.getByRole('button', { name: 'Hide intro', exact: true }).click();
      const next = page.locator('.reading-navigation a[rel="next"]');
      if (route.includes('/tim/')) assert.equal(await next.getAttribute('href'), '#/discrete');
      if (route.includes('/master-theorem/')) assert.equal(await next.getAttribute('href'), '#/complexity');
      assert.equal(await page.locator('.reading-navigation').count(), 1);
    }
    console.log(`Breadcrumbs, aligned intro icons and cross-domain page links passed at ${width}px.`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/#/discrete/master-theorem/understand`);
  await page.locator('.reading-navigation a[rel="next"]').click();
  await page.waitForURL('**/#/complexity');
  await page.waitForFunction(() => scrollY === 0);
  await page.locator('.reading-navigation a[rel="prev"]').click();
  await page.waitForURL('**/#/discrete/master-theorem/understand');
  await page.waitForFunction(() => scrollY === 0);
  await page.goto(`${origin}/#/discrete/master-theorem/understand`);
  await page.screenshot({ path: 'screenshots/reading-navigation-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.screenshot({ path: 'screenshots/reading-navigation-390.png', fullPage: true });
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${origin}/#/discrete/induction/practice`);
    await page.reload(); // A fresh visit shows just the active domain expanded.
    await open();
    await page.waitForTimeout(250); // Capture the finished drawer transition, not an intermediate frame.
    await page.screenshot({ path: `screenshots/navigation-${viewport.width}.png` });
    await close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
