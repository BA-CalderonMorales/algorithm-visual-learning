import { comparisonTrace } from '../complexity/comparison-trace.ts';
import { oddSumTrace } from '../discrete/odd-sum.ts';
import { arrayTrace } from '../structures/array-trace.ts';
import { countTrace, recurrenceTrace, spaceTrace } from '../complexity/code-traces.ts';
import { inductionTrace, telescopeTrace } from '../discrete/code-traces.ts';
import { linkedTrace } from '../structures/code-traces.ts';
const links = {
  title: 'Linked lists · follow the references',
  intro: '',
  input: '8, 3, 6, 2',
  followPointer: true,
  variantGroups: [
    {
      label: 'Operation',
      options: [
        { id: 'prepend', label: 'Insert · head' },
        { id: 'insert', label: 'Insert · middle' },
        { id: 'append', label: 'Insert · tail' },
        { id: 'remove', label: 'Remove' },
        { id: 'reverse', label: 'Reverse' },
        { id: 'search', label: 'Search · 6' },
        { id: 'traverse', label: 'Traverse / yield' },
      ],
    },
    {
      label: 'List type',
      options: [
        { id: 'single', label: 'Singly linked' },
        { id: 'double', label: 'Doubly linked' },
      ],
    },
  ],
  build: (values, variant) => {
    const [operation, representation] = variant.split(':');
    return linkedTrace(values, operation, representation === 'double');
  },
};
export const codeLabs = {
  'lower-bound': {
    title: 'Comparison sorting · which orders remain?',
    intro:
      'Use exactly three distinct values. Every comparison rules out incompatible orders; follow the surviving identities.',
    input: '8, 3, 5',
    build: comparisonTrace,
  },
  time: {
    title: 'Count the executed work',
    intro:
      'Change n, then compare one loop, dependent nested loops and repeated halving. The operation counter is an exact measurement for this code, not an asymptotic bound.',
    input: '5',
    size: true,
    variants: [
      { id: 'triangular', label: 'Dependent loops' },
      { id: 'linear', label: 'One loop' },
      { id: 'halving', label: 'Repeated halving' },
    ],
    build: countTrace,
  },
  master: {
    title: 'Recurrence · one call versus many',
    intro:
      'Count calls actually executed. Mutually exclusive branches do not create two children; repeated calls do. Watch each parent wait for its children.',
    input: '6',
    size: true,
    variants: [
      { id: 'two-half', label: '2 calls on n/2' },
      { id: 'one-half', label: '1 call on n/2' },
      { id: 'three-half', label: '3 calls on n/2' },
      { id: 'subtract', label: '1 call on n−1' },
    ],
    build: recurrenceTrace,
  },
  space: {
    title: 'Space · live frames versus total calls',
    intro:
      'A returned frame no longer occupies the active stack. Compare current live frames, peak frames and total calls on the same execution.',
    input: '5',
    size: true,
    build: spaceTrace,
  },
  induction: {
    title: 'Induction · extend the whole sum',
    intro:
      'Use a small picture to understand the step, then read the algebra for arbitrary k. A few examples illustrate a proof; they do not establish it.',
    input: '3',
    size: true,
    variants: [
      { id: 'triangle', label: 'Sum of consecutive integers' },
      { id: 'odd', label: 'Sum of odd integers' },
    ],
    build: (k, variant) => (variant === 'odd' ? oddSumTrace(k) : inductionTrace(k)),
  },
  telescoping: {
    title: 'Telescoping · cancel shared terms',
    intro: 'Expand each fraction first. Match equal terms with opposite signs; the two endpoints survive.',
    input: '5',
    size: true,
    build: telescopeTrace,
  },
  'python-lists': {
    title: 'Python lists · shift indices',
    intro: '',
    input: '8, 3, 6, 2',
    followPointer: true,
    build: arrayTrace,
  },
  'list-adt': {
    ...links,
    defaultGroups: ['prepend', 'single'],
    title: 'List operations · follow the references',
    intro: '',
  },
  'list-storage': {
    ...links,
    defaultGroups: ['append', 'single'],
    title: 'Linked storage · follow references',
  },
  'list-traversal': {
    ...links,
    defaultGroups: ['traverse', 'single'],
    title: 'Traversal · follow current',
  },
  'list-insertion': {
    ...links,
    defaultGroups: ['insert', 'single'],
    title: 'Insertion · rewire references',
  },
};
