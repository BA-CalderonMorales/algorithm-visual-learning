import assert from 'node:assert/strict';

// Check resolved styles, including browser-default form controls and pseudo
// elements. CSS source checks alone cannot catch inherited/runtime styling.
export async function assertSharpCorners(page, { allowPhaseCircles = false } = {}) {
  const rounded = await page.evaluate(allowPhaseCircles => {
    const violations = [];
    const properties = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'];
    for (const element of document.querySelectorAll('body *')) {
      if (allowPhaseCircles && element.matches('#quick-sort-walkthrough .node')) continue;
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        if (pseudo && ['none', 'normal'].includes(style.content)) continue;
        const radii = properties.map(property => style[property]);
        if (radii.some(value => value.split(/\s+/).some(part => parseFloat(part) > 0))) {
          violations.push({ element: element.tagName.toLowerCase(), class: element.getAttribute('class'), pseudo, radii });
        }
      }
    }
    return violations;
  }, allowPhaseCircles);
  assert.deepEqual(rounded, [], `Rounded UI corners on ${page.url()}: ${JSON.stringify(rounded)}`);
}
