export function insertionState(step: number, mode = 'middle') {
  const x = mode === 'prepend' ? 35 : mode === 'append' ? 545 : 205;
  const placed = step === 2;
  const order =
    mode === 'prepend' ? ['X', 'A', 'B', 'C'] : mode === 'append' ? ['A', 'B', 'C', 'X'] : ['A', 'X', 'B', 'C'];
  const nodes = ['A', 'B', 'C', 'X'].map((id, i) => ({
    id,
    x: placed ? 35 + order.indexOf(id) * 170 : id === 'X' ? x : 35 + i * 170,
    y: !placed && id === 'X' ? 185 : 65,
  }));
  const links = placed
    ? order.slice(0, -1).map((id, i) => [id, order[i + 1]])
    : [
        ['A', 'B'],
        ['B', 'C'],
      ];
  if (step === 1) links.push(mode === 'append' ? ['C', 'X'] : ['X', mode === 'prepend' ? 'A' : 'B']);
  const statements =
    mode === 'prepend'
      ? ['Create X; current = head', 'X.next = head', 'head = X; size += 1']
      : mode === 'append'
        ? ['Create X; X.next = None', 'tail.next = X', 'tail = X; size += 1']
        : ['Create X; prev = A; current = B', 'X.next = current', 'prev.next = X; size += 1'];
  const explanations =
    mode === 'append'
      ? [
          'The new final node has a terminating next reference.',
          'C now links to X. The saved tail still identifies C until the metadata update.',
          'Update tail to X. Both the chain and tail invariant now agree.',
        ]
      : [
          'The original chain remains intact while X is unlinked.',
          'Save the suffix before changing the link that currently reaches it.',
          'Reconnect the prefix. Every original node is still reachable exactly once.',
        ];
  return {
    nodes,
    links,
    statement: statements[step],
    explanation: explanations[step],
    head: placed && mode === 'prepend' ? 'X' : 'A',
    tail: placed && mode === 'append' ? 'X' : 'C',
    order: placed || (step === 1 && mode === 'append') ? order : ['A', 'B', 'C'],
  };
}
