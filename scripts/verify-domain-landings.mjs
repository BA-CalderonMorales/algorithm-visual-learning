import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {entries} from '../src/shared/study/library.ts';
import {assertSharpCorners} from './assert-sharp-corners.mjs';

const origin = process.env.PLAY_PREVIEW_URL || 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless:true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}),
});
const page = await browser.newPage();
// Saved collapse preferences from older releases must not hide directory tabs.
await page.addInitScript(() => localStorage.setItem('study-directory-tabs-collapsed', 'true'));
const errors = [];
page.on('pageerror', error => errors.push(error.message));
async function verifyHomeNavigation() {
  for (const [view, route] of [['explore', '#/home'], ['resources', '#/home/resources'], ['author', '#/home/author']]) {
    await page.goto(origin + '/' + route);
    const tab = page.locator('#home-tab-' + view);
    await tab.waitFor();
    assert.equal(await tab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.getByRole('tablist', { name: 'DSA Study Studio views' }).getAttribute('aria-orientation'), 'vertical');
    const rail = await page.locator('.library-navigation').boundingBox();
    const content = await page.locator('.home-panel').boundingBox();
    assert.ok(rail.x + rail.width <= content.x + 1, 'Home tabs remain beside content, not above it');
    assert.equal(await page.locator('.home-panel').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
    await assertSharpCorners(page);
  }
  await page.locator('#home-tab-author').press('Home');
  await page.waitForURL('**/#/home');
  await page.locator('.home-panel').evaluate(el => el.scrollTop = el.scrollHeight);
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(0, 20));
  const outerTop = await page.evaluate(() => scrollY);
  await page.locator('#home-tab-explore').press('ArrowDown');
  await page.waitForURL('**/#/home/resources');
  await page.waitForFunction(() => document.querySelector('.home-panel').scrollTop === 0);
  assert.equal(await page.evaluate(() => scrollY), outerTop, 'Home tab navigation preserves outer scroll');
  await page.locator('#home-tab-resources').press('ArrowDown');
  await page.waitForURL('**/#/home/author');
  await page.goBack();
  await page.waitForURL('**/#/home/resources');
  assert.equal(await page.locator('#home-tab-resources').getAttribute('aria-selected'), 'true', 'Back restores Home selection');
  await page.goto(origin + '/#/home');
  await page.locator('.home-panel').waitFor();
  await page.waitForTimeout(150);
  const railTop = await page.locator('.library-navigation').evaluate(el => el.getBoundingClientRect().top);
  await page.locator('.home-panel').evaluate(el => el.scrollTop = el.scrollHeight);
  const unchangedTop = await page.locator('.library-navigation').evaluate(el => el.getBoundingClientRect().top);
  assert.ok(Math.abs(unchangedTop - railTop) <= 1, 'Inner reading scroll never moves the Home rail');
  await page.locator('.home-panel').evaluate(el => el.scrollTop = 0);
}
async function verifyHomeRows(width) {
  await assertSharpCorners(page);
  const rows = await page.locator('.library-rows .library-row').evaluateAll(els => els.map(el => {
    const style = getComputedStyle(el);
    const sketch = el.querySelector('.library-sketch');
    const svg = sketch.querySelector('svg');
    return {
      display:style.display, gap:parseFloat(style.columnGap),
      padding:parseFloat(style.paddingTop), border:style.borderBottomStyle,
      descriptionSize:parseFloat(getComputedStyle(el.querySelector('.library-copy p')).fontSize),
      sketchDisplay:getComputedStyle(sketch).display,
      svgWidth:svg.getBoundingClientRect().width,
      pathFill:getComputedStyle(svg.querySelector('path')).fill,
      textFill:getComputedStyle(svg.querySelector('text')).fill,
      top:el.getBoundingClientRect().top, bottom:el.getBoundingClientRect().bottom,
    };
  }));
  assert.equal(rows.length, entries.length, 'Home shows every registered domain');
  for (const [index, row] of rows.entries()) {
    assert.equal(row.display, 'grid', 'Home must render styled shared rows, not obsolete markup');
    assert.ok(row.gap >= 12 && row.padding >= 20, 'Home row spacing must survive shared-style refactors');
    assert.equal(row.border, 'solid');
    assert.equal(row.descriptionSize, 13);
    assert.equal(row.pathFill, 'none', 'Diagram paths must not become solid black shapes');
    assert.notEqual(row.textFill, 'rgb(0, 0, 0)', 'Diagram labels retain their readable theme');
    if (width <= 600) {
      assert.equal(row.sketchDisplay, 'none', 'Phone layout intentionally hides decorative sketches');
    } else {
      assert.ok(row.svgWidth >= 140 && row.svgWidth <= 180, 'Diagram stays compact, not full-width');
    }
    if (index) assert.ok(row.top >= rows[index - 1].bottom, 'Home rows do not overlap');
  }
  assert.equal(await page.locator('.library-panel').evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
}
const viewports = [
  {width:1440,height:1000}, {width:900,height:900}, {width:600,height:900},
  {width:390,height:844}, {width:320,height:700}, {width:844,height:390},
];
await mkdir(new URL('../screenshots/', import.meta.url), {recursive:true});
try {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await verifyHomeNavigation();
    await page.goto(origin+'/#/home');
    await page.locator('.library-panel').waitFor();
    await verifyHomeRows(viewport.width);
    if ([1440,390].includes(viewport.width)) {
      await page.waitForTimeout(150);
      await page.screenshot({path:'screenshots/home-shared-rows-'+viewport.width+'.png',fullPage:true});
    }
    const home = await page.locator('.library-panel').evaluate(el => ({
      height:el.clientHeight, padding:getComputedStyle(el).padding,
      border:getComputedStyle(el.parentElement).border,
    }));
    for (const entry of entries) {
      for (const view of ['explore','connections']) {
        const route = entry.href + (view === 'connections' ? '/connections' : '');
        await page.goto(origin+'/'+route);
        const tab = page.getByRole('tab', {name:view === 'explore' ? 'Explore' : 'Connections', exact:true});
        await tab.waitFor();
        assert.equal(await page.locator('.library-navigation [role="tablist"]').getAttribute('aria-orientation'), 'vertical', 'All core domains share the side-tab layout');
        await assertSharpCorners(page);
        assert.equal(await tab.getAttribute('aria-selected'), 'true', 'Direct-link routing');
        assert.equal(await page.locator('main h1').count(), 0, 'Collapsed intro by default');
        assert.equal(await page.locator('.library-panel').getAttribute('aria-labelledby'), await tab.getAttribute('id'));
        const panel = await page.locator('.library-panel').evaluate(el => ({
          height:el.clientHeight, padding:getComputedStyle(el).padding,
          border:getComputedStyle(el.parentElement).border,
          overflowX:el.scrollWidth > el.clientWidth + 1,
          overflow:getComputedStyle(el).overflowY, content:el.textContent.trim(),
        }));
        assert.equal(panel.height, home.height, 'Same panel height as Home');
        assert.equal(panel.padding, entry.id === 'algorithms' && view === 'explore' ? '0px' : home.padding, 'Only the comparison table opts into edge-to-edge layout');
        assert.equal(panel.border, home.border, 'Same workspace border as Home');
        assert.equal(panel.overflow, 'auto');
        assert.equal(panel.overflowX, false, route+' internal horizontal overflow at '+viewport.width);
        if (entry.id === 'algorithms' && view === 'explore' && await page.locator('.catalog').evaluate(el => el.clientWidth > 840)) {
          const headers = await page.locator('.catalog-table thead th').evaluateAll(els =>
            els.map(el => ({
              label:el.textContent.trim(), width:el.clientWidth, contentWidth:el.scrollWidth,
              buttonWidth:el.querySelector('button')?.clientWidth,
              buttonContentWidth:el.querySelector('button')?.scrollWidth,
            })));
          const overflowing = headers.filter(el => el.contentWidth > el.width + 1 ||
            (el.buttonContentWidth && el.buttonContentWidth > el.buttonWidth + 1));
          assert.deepEqual(overflowing, [], 'Sortable headings must not spill into neighboring columns: '+JSON.stringify(overflowing));
        }
        assert.ok(panel.content.length > 100, 'Meaningful panel content');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        if (entry.id === 'algorithms' && view === 'explore') {
          const filter = page.getByPlaceholder('Try ‘divide and conquer’');
          const toolbar = page.locator('.catalog-toolbar');
          const before = await toolbar.boundingBox();
          await page.locator('.library-panel').evaluate(el => el.scrollTop = el.scrollHeight);
          const after = await toolbar.boundingBox();
          assert.ok(Math.abs(after.y - before.y) < 1, 'Filter stays pinned at the top of Explore while scrolling');
          const field = await filter.boundingBox();
          assert.equal(await page.evaluate(({x,y}) => document.elementFromPoint(x,y)?.matches('.catalog-toolbar input'),
            {x:field.x + field.width / 2, y:field.y + field.height / 2}), true, 'Sticky filter stays above scrolling rows');
          await filter.fill('merge sort');
          assert.equal(await page.locator('.catalog-table tbody tr').count(), 1, 'Filter works from the scrolled panel');
          await filter.fill('');
          await page.locator('.library-panel').evaluate(el => el.scrollTop = 0);
        }
        if (entry.id !== 'algorithms' || view === 'connections') {
          assert.equal(await page.locator('.library-row').count(), view === 'connections' ? entries.length - 1 : entry.id === 'problems' ? 1 : 3);
          const links = await page.locator('.library-row a').evaluateAll(els => els.map(el => ({
            href:el.getAttribute('href'), decoration:getComputedStyle(el).textDecorationLine,
          })));
          assert.ok(links.every(link => link.href.startsWith('#/') && link.decoration === 'none'));
        }
      }
      // Tab clicks/keyboard navigation do not force the outer page back to top.
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo(0, 20));
      const before = await page.evaluate(() => scrollY);
      await page.getByRole('tab', {name:'Explore',exact:true}).click();
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => scrollY), before, 'Same directory tab preserves outer scroll');
      await page.locator('.library-panel').evaluate(el => el.scrollTop = el.scrollHeight);
      const rail = await page.locator('.library-navigation').boundingBox();
      const panelBounds = await page.locator('.library-panel').boundingBox();
      assert.ok(rail.x + rail.width <= panelBounds.x + 1, 'Directory tabs remain beside content');
      await page.getByRole('tab', {name:'Explore',exact:true}).press('ArrowDown');
      await page.locator('[role="tab"][aria-selected="true"]').filter({hasText:'Connections'}).waitFor();
      await page.waitForFunction(() => document.querySelector('.library-panel').scrollTop === 0);
      assert.equal(await page.evaluate(() => scrollY), before, 'Side-tab keyboard navigation preserves outer scroll');
      assert.equal(await page.getByRole('tab', {name:'Connections',exact:true}).getAttribute('aria-selected'), 'true');
      await page.goBack();
      await page.locator('[role="tab"][aria-selected="true"]').filter({hasText:'Explore'}).waitFor();
      assert.equal(await page.getByRole('tab', {name:'Explore',exact:true}).getAttribute('aria-selected'), 'true', 'Browser back restores directory view');
      await page.getByRole('button', {name:'Show intro',exact:true}).click();
      await page.locator('main h1').waitFor();
      await page.getByRole('button', {name:'Hide intro',exact:true}).click();
      const panelBeforeCollapse = await page.locator('.library-panel').boundingBox();
      await page.locator('.library-panel').evaluate(el => el.scrollTop = Math.min(30, el.scrollHeight - el.clientHeight));
      const readingPosition = await page.locator('.library-panel').evaluate(el => el.scrollTop);
      const collapse = page.getByRole('button', {name:'Collapse page tabs',exact:true});
      const togglePosition = await collapse.boundingBox();
      const originalRail = await page.locator('.library-navigation').boundingBox();
      await collapse.click();
      const expand = page.getByRole('button', {name:'Expand page tabs',exact:true});
      assert.equal(await expand.getAttribute('aria-expanded'), 'false');
      const expandedRail = await page.locator('.library-navigation').boundingBox();
      const expandPosition = await expand.boundingBox();
      assert.ok(Math.abs(expandPosition.x + expandPosition.width - expandedRail.x - expandedRail.width + 2) < 2, 'Control sits at the rail bottom-right, inside its border');
      assert.ok(Math.abs((expandPosition.y - expandedRail.y) - (togglePosition.y - originalRail.y)) < 1, 'Rail toggle keeps its vertical position within the rail');
      assert.ok(Math.abs(expandPosition.y + expandPosition.height - expandedRail.y - expandedRail.height + 2) < 1, 'Control is bottom aligned');
      assert.equal(await page.locator('.library-navigation [role="tablist"]').isVisible(), false);
      assert.ok((await page.locator('.library-panel').boundingBox()).width > panelBeforeCollapse.width, 'Collapsing gives space back to content');
      const maximumScroll = await page.locator('.library-panel').evaluate(el => el.scrollHeight - el.clientHeight);
      assert.equal(await page.locator('.library-panel').evaluate(el => el.scrollTop), Math.min(readingPosition, maximumScroll), 'Collapsing retains reading position unless the wider content now fits');
      await page.reload();
      await collapse.waitFor();
      assert.equal(await page.locator('.library-navigation [role="tablist"]').isVisible(), true);
      assert.equal(await page.getByRole('button', {name:'Collapse page tabs',exact:true}).getAttribute('aria-expanded'), 'true');
      await collapse.click();
      await page.evaluate(route => { location.hash = route; }, entry.href + '/connections');
      await page.waitForFunction(() => document.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby')?.endsWith('-connections'));
      assert.equal(await expand.getAttribute('aria-expanded'), 'false', 'Switching views within a directory retains the manual collapse');
      await page.evaluate(() => { location.hash = '#/home'; });
      await page.locator('#home-tab-explore').waitFor();
      assert.equal(await collapse.getAttribute('aria-expanded'), 'true', 'Entering another directory starts expanded');
      await page.evaluate(route => { location.hash = route; }, entry.href);
      await page.getByRole('tab', {name:'Explore',exact:true}).waitFor();
      assert.equal(await collapse.getAttribute('aria-expanded'), 'true', 'Returning to a core directory starts expanded');
      if ([1440,390].includes(viewport.width)) {
        await page.evaluate(() => window.scrollTo(0,0));
        await page.screenshot({path:'screenshots/landing-'+entry.id+'-'+viewport.width+'.png',fullPage:true});
      }
    }
    console.log(viewport.width+'×'+viewport.height+': consistent shells, direct links, responsive rows, and tab navigation passed.');
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/#/algorithms/sorting');
  await page.locator('.catalog-table').waitFor();
  assert.equal(await page.getByRole('heading', {name:'Compare the sorting algorithms',exact:true}).count(), 0);
  assert.equal(await page.getByText('The collection', {exact:true}).count(), 0);
  assert.equal(await page.locator('.catalog-table-wrap').evaluate(el => getComputedStyle(el).borderTopWidth), '0px');
  const tableWidth = await page.locator('.catalog-table').evaluate(el => el.getBoundingClientRect().width);
  const panelWidth = await page.locator('.library-panel').evaluate(el => el.clientWidth);
  assert.ok(Math.abs(tableWidth - panelWidth) <= 1, 'Comparison table uses the panel width without an inset frame');
  assert.equal(await page.locator('.catalog-table tbody tr').count(), 7);
  assert.match(await page.locator('.catalog-table tbody tr').first().innerText(), /Selection Sort/);
  await page.getByRole('button', {name:'Difficulty'}).click();
  assert.match(await page.locator('.catalog-table tbody tr').first().innerText(), /Selection Sort/);
  assert.equal(await page.locator('.catalog-table thead th').nth(1).getAttribute('aria-sort'), 'ascending');
  await page.getByRole('button', {name:'Difficulty'}).click();
  assert.match(await page.locator('.catalog-table tbody tr').first().innerText(), /Tim Sort/);
  await page.getByRole('button', {name:'Difficulty'}).click();
  assert.match(await page.locator('.catalog-table tbody tr').first().innerText(), /Selection Sort/, 'Third click returns to default learning order');
  await page.locator('.library-panel').evaluate(el => el.scrollTop = el.scrollHeight);
  assert.ok(await page.getByRole('link', {name:'Tim Sort'}).isVisible(), 'Catalog remains reachable inside bounded panel');
  await page.locator('.library-panel').evaluate(el => el.scrollTop = 0);
  await page.getByPlaceholder('Try ‘divide and conquer’').fill('merge sort');
  assert.equal(await page.locator('.catalog-table tbody tr').count(), 1);
  await page.getByRole('tab', {name:'Connections',exact:true}).click();
  await page.getByRole('tab', {name:'Explore',exact:true}).click();
  assert.equal(await page.getByPlaceholder('Try ‘divide and conquer’').inputValue(), 'merge sort', 'Filter preserved across directory tabs');
  await page.getByPlaceholder('Try ‘divide and conquer’').fill('not-a-sort');
  await page.getByText('No matches. Try a sort name or a memory cue.', {exact:true}).waitFor();
  await page.goto(origin+'/#/home/resources');
  await page.getByRole('heading', {name:'Use the explanation that clicks for you.',exact:true}).waitFor();
  await page.getByRole('tab', {name:'Author’s note',exact:true}).click();
  await page.getByRole('heading', {name:'This began with frustration.',exact:true}).waitFor();
  await page.getByRole('tab', {name:'Explore',exact:true}).click();
  await page.locator('.library-rows').waitFor();
  await verifyHomeRows(1440);
  assert.deepEqual(errors, [], 'Runtime errors');
  console.log('Sorting filter/order/empty state and Home resources/author preserved.');
} finally {
  await browser.close();
}
