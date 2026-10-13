export async function exposeSectionTabs(page, label) {
  await page.locator('.tab-workspace').first().waitFor();
  const rail = label
    ? page.getByRole('tablist', { name: label, exact: true, includeHidden: true }).locator('..').locator('..')
    : page.locator('.section-rail').first();
  const toggle = rail.locator(':scope > .section-toggle');
  if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
}
export async function closeSectionTabs(page) {
  const toggles = page.locator('.section-toggle[aria-expanded="true"]');
  while (await toggles.count()) await toggles.first().click();
}
