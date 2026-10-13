// Playback regressions open the same disclosure that a student opens.
export async function revealAnimation(page) {
  const disclosure = page.locator('details.animation-disclosure');
  const hash = new URL(page.url()).hash;
  const hasReference =
    /^#\/algorithms\/(shell|merge|tim)\/play$/.test(hash) ||
    /^#\/(discrete\/(induction|telescoping|master-theorem)|complexity\/(time|space|sorting-lower-bound)|structures\/(list-adt|python-lists|list-storage|list-traversal|list-insertion))\/visualize$/.test(
      hash,
    );
  if (hasReference) await disclosure.first().waitFor();
  if (await disclosure.count()) {
    if (!(await disclosure.first().evaluate((el) => el.open))) await disclosure.first().locator('summary').click();
    // Native toggle is dispatched asynchronously; wait for the lazy presenter.
    await disclosure.first().locator('.concept-film, .node-workbench').first().waitFor();
  }
}
