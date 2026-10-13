const build = (id, title, question, idea, anchor, flow, facts, caution, example, checks) => ({
  id,
  domain: 'structures',
  slug: id,
  title,
  question,
  intro: idea,
  idea,
  anchor: `<mtext>${anchor}</mtext>`,
  anchorLabel: 'The relationship to remember',
  flow: flow.map(([title, body]) => ({ title, body })),
  facts: facts.map(([label, body]) => ({ label, body })),
  caution,
  examples: [
    {
      title: example.title,
      intro: example.intro,
      steps: example.steps.map(([title, body]) => ({ title, body })),
      result: example.result,
    },
  ],
  checks: checks.map(([question, answer]) => ({ question, answer })),
});
export const lessons = {
  'list-adt': build(
    'list-adt',
    'The List ADT',
    'What does a list promise without choosing a storage layout?',
    'A list is an ordered sequence with operations such as finding, accessing a position, inserting, removing, and clearing. The ADT specifies behavior; its implementation determines cost.',
    'behavior first; representation second',
    [
      [
        'Define the sequence',
        'A list can be empty. Positions have a consistent ordering, and duplicate values may occupy different positions.',
      ],
      [
        'Define each operation',
        'Specify whether find returns the first position or a boolean, whether insertion happens before or after a position, and what an absent item does.',
      ],
      [
        'Choose a representation',
        'A dynamic array and a linked chain can implement the same promised sequence while using different access and update procedures.',
      ],
    ],
    [
      [
        'Index conventions',
        'Teaching ADTs may label positions from one; Python indexes from zero. Translate deliberately rather than mixing conventions.',
      ],
      [
        'Duplicate values',
        'Removing a value and removing a position are different contracts. Define which occurrence is affected.',
      ],
    ],
    'Names alone do not specify behavior. An operation named insert may have a different contract in another API.',
    {
      title: 'One sequence, explicit operations',
      intro: 'Use zero-based positions in [8, 3, 8].',
      steps: [
        ['Find', 'The first occurrence of 8 is at index 0, even though another occurs at index 2.'],
        ['Insert before index 1', 'Insert 5 to obtain [8, 5, 3, 8].'],
        ['Remove index 2', 'Remove 3 to obtain [8, 5, 8].'],
      ],
      result: 'The sequence operations are defined independently of where values live in memory.',
    },
    [
      ['Does an ADT require linked nodes?', 'No. It specifies observable operations, not one implementation.'],
      ['Is find(8) necessarily a boolean?', 'No. Its contract may return a position; the API must define the result.'],
    ],
  ),
  'python-lists': build(
    'python-lists',
    'Python Lists and Identity',
    'Are equal values necessarily the same object?',
    'A Python list is a resizable array of object references. It permits mixed element types and repeated values; its slots are not a linked list.',
    '== compares values; is compares identity',
    [
      [
        'Read positions',
        'Indexing starts at zero; negative indices count from the end. Slices produce a new list of references.',
      ],
      ['Check membership', 'in checks for a matching element using equality. It is generally a linear scan.'],
      [
        'Track aliases',
        'Assigning b = a makes two names refer to one list. A shallow copy creates another list but retains references to the same nested objects.',
      ],
    ],
    [
      [
        'Memory layout',
        'CPython keeps a contiguous array of references. The referenced Python objects may live at separate locations.',
      ],
      [
        'Typed arrays',
        'A numeric array can store homogeneous values compactly; performance depends on the workload and implementation.',
      ],
    ],
    'Do not use is to test whether separately created lists contain equal values.',
    {
      title: 'Aliasing and a shallow copy',
      intro: 'a = [2, 4]; b = a; c = a[:].',
      steps: [
        ['Compare', 'a == c is true; a is c is false. They are distinct lists containing equal values.'],
        ['Modify', 'b.append(6) changes a too, because b is a.'],
        [
          'Inspect the copy',
          'c remains [2, 4]. With nested mutable objects, a shallow copy would still share those nested objects.',
        ],
      ],
      result: 'Equality, identity, and copying answer different questions.',
    },
    [
      ['What does x in values test?', 'Membership using equality, not whether x is the list object.'],
      [
        'Does a shallow copy clone every nested object?',
        'No. It copies the outer reference array and retains nested references.',
      ],
    ],
  ),
  'list-storage': build(
    'list-storage',
    'Arrays and Linked Storage',
    'Why does the same insertion cost different amounts?',
    'An array locates a slot from its index. A singly linked list follows next references from a known node. Their representations make different operations direct.',
    'locate the position + perform the update',
    [
      [
        'Access an array',
        'A fixed-width slot address is base plus index times slot width. A dynamic array can still provide constant-time indexed access.',
      ],
      [
        'Walk a chain',
        'head identifies the first node. Each next reference leads to another node, and the final next is None.',
      ],
      [
        'Count the full operation',
        'Rewiring a known predecessor is constant work, but locating that predecessor can require a linear traversal.',
      ],
    ],
    [
      [
        'Array insertion',
        'Inserting near the front shifts a suffix, costing O(n) in the worst case. Dynamic-array append is amortized O(1), with occasional O(n) growth.',
      ],
      [
        'Linked append',
        'A head-only chain scans to find the end. Maintaining a tail makes append O(1), provided head, tail, and size stay consistent.',
      ],
    ],
    '“Linked insertion is O(1)” needs a known insertion location; searching by value or index can dominate the cost.',
    {
      title: 'Append with and without a tail',
      intro: 'The chain is A → B → C → None.',
      steps: [
        ['Head only', 'Visit A, B, and C to locate the last next field.'],
        ['With tail', 'tail already identifies C. Set C.next to D, then tail to D.'],
        ['Empty chain', 'For the first node, set both head and tail to that node.'],
      ],
      result: 'Extra maintained state can remove a traversal, but creates invariants to preserve.',
    },
    [
      ['Is indexing a singly linked list O(1)?', 'No. Finding position k requires following links, generally O(k).'],
      ['Can nodes with equal data be distinct?', 'Yes. Node identity and stored value are separate.'],
    ],
  ),
  'list-traversal': build(
    'list-traversal',
    'Traversal, Search, and Generators',
    'What state must survive between two visits?',
    'Traversal follows next until None. Search stops at a match or the end. A Python generator yields a value while retaining its execution state for the next request.',
    'current = current.next',
    [
      ['Start at head', 'An empty list has head equal to None, so traversal visits no nodes.'],
      [
        'Visit and advance',
        'Read current.data, then replace current with current.next. Never advance without checking the current node exists.',
      ],
      [
        'Pause with yield',
        'A generator suspends after a yield and resumes when next is requested. It does not restart the whole traversal each time.',
      ],
    ],
    [
      ['Search cost', 'An early match can take O(1); an absent item or final-node match requires O(n).'],
      [
        'Termination assumption',
        'A normal list must terminate at None. A cycle needs detection or a visited set to avoid an infinite traversal.',
      ],
    ],
    'Calling a generator function creates a generator; next(generator) advances its suspended execution.',
    {
      title: 'Search one node at a time',
      intro: 'Search for 7 in nodes containing 4 → 7 → 9.',
      steps: [
        ['Visit 4', 'No match. Advance to its next node.'],
        ['Visit 7', 'A match satisfies the search contract, so stop.'],
        ['Contrast an absent value', 'Searching for 2 would inspect all three nodes and finish at None.'],
      ],
      result: 'Search does not need to scan the suffix after finding the requested first match.',
    },
    [
      ['Does yield discard all local state?', 'No. It suspends execution with state preserved.'],
      ['What is worst-case membership-search time?', 'O(n), because every node may need inspection.'],
    ],
  ),
  'list-insertion': build(
    'list-insertion',
    'Prepending and Inserting Nodes',
    'How do we attach a node without losing the suffix?',
    'Save the insertion location, connect the new node to the suffix, then connect the predecessor—or head—to the new node.',
    'new.next = current; prev.next = new',
    [
      [
        'Locate',
        'For an interior insertion, keep prev and current. A search by value should define first-match and missing-value behavior.',
      ],
      ['Preserve the suffix', 'Set new.next to current before overwriting prev.next.'],
      [
        'Reconnect the prefix',
        'Set prev.next to new. At the front, replace head instead. At an empty list, update both head and any maintained tail.',
      ],
    ],
    [
      [
        'Index checks',
        'This lesson uses zero-based insertion positions from 0 through size, including append at size. Reject positions outside that range.',
      ],
      ['Metadata', 'Increase size after a successful insertion. Update tail on appending; otherwise retain it.'],
    ],
    'Changing prev.next first and then deriving the suffix from it can create a self-loop or lose the original next node.',
    {
      title: 'Insert X between A and B',
      intro: 'Initial chain: A → B → C. prev is A; current is B.',
      steps: [
        ['Connect suffix', 'X.next = B. The original chain is still reachable from head.'],
        ['Connect prefix', 'A.next = X. The chain becomes A → X → B → C.'],
        [
          'Maintain metadata',
          'Increase size. tail remains C. For prepending instead, set X.next = head then head = X.',
        ],
      ],
      result: 'Every original node remains reachable exactly once, and the new node occupies the requested position.',
    },
    [
      ['Which assignment preserves the suffix first?', 'new.next = current.'],
      [
        'What changes when inserting into an empty tail-tracked list?',
        'Both head and tail become the new node, and size becomes one.',
      ],
    ],
  ),
};
