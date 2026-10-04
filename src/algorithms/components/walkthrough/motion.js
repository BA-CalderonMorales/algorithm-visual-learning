import { animate, stagger } from 'motion';

const rowSelector = '.history-row.current, .row.current, .row.active';
const compareSelector = '.compare, .focus, .scan, .minimum, .hit, .bucket, .key';
const actionSelector = '.swap, .shift, .chosen, .take, .write, .placed, .inserted';
const settledSelector = '.sorted, .done, .run, .prefix, .merged, .left-run, .right-run';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function animateGroup(elements, keyframes, options) {
  if (elements.length && !reducedMotion.matches) animate(elements, keyframes, options);
}

function animateCurrentRow(row) {
  if (reducedMotion.matches || row.dataset.motionPlayed === 'true') return;
  row.dataset.motionPlayed = 'true';

  const comparisons = [...row.querySelectorAll(compareSelector)];
  const actions = [...row.querySelectorAll(actionSelector)];
  const settled = [...row.querySelectorAll(settledSelector)];
  const compareDelay = 0.08;
  const actionDelay = compareDelay + (comparisons.length ? comparisons.length * 0.045 + 0.06 : 0);
  const settleDelay = actionDelay + (actions.length ? actions.length * 0.05 + 0.06 : 0);

  animate(
    row,
    { opacity: [0.68, 1], y: [9, 0] },
    {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  );

  animateGroup(
    comparisons,
    { scale: [1, 1.075, 1] },
    {
      duration: 0.38,
      delay: stagger(0.04, { startDelay: compareDelay }),
      ease: 'easeOut',
    },
  );

  actions.forEach((element, index) => {
    let x = 0;
    let y = 0;
    if (element.classList.contains('shift') || element.classList.contains('write')) x = -13;
    else if (element.classList.contains('swap')) x = index % 2 === 0 ? 11 : -11;
    else if (element.classList.contains('take')) {
      x = element.closest('.run-strip.right') ? 10 : -10;
    } else if (element.classList.contains('placed')) y = -10;

    animate(
      element,
      { x: [x, 0], y: [y, 0], scale: [0.92, 1] },
      {
        duration: 0.42,
        delay: actionDelay + index * 0.045,
        ease: [0.22, 1, 0.36, 1],
      },
    );
  });

  animateGroup(
    settled,
    { scale: [0.96, 1.035, 1] },
    {
      duration: 0.38,
      delay: stagger(0.035, { startDelay: settleDelay }),
      ease: 'easeOut',
    },
  );
}

function startStepAnimations() {
  if (!('MutationObserver' in window)) return;

  const seenRows = new WeakSet();
  const reveal = (node) => {
    if (!(node instanceof Element)) return;
    if (node.matches(rowSelector) && !seenRows.has(node)) {
      seenRows.add(node);
      requestAnimationFrame(() => animateCurrentRow(node));
    }
    node.querySelectorAll?.(rowSelector).forEach((row) => {
      if (seenRows.has(row)) return;
      seenRows.add(row);
      requestAnimationFrame(() => animateCurrentRow(row));
    });
  };

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(reveal));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(rowSelector).forEach(reveal);
}

startStepAnimations();
