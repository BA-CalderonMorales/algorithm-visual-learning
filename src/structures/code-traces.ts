import { recorder } from '../shared/trace/model.ts';
export function linkedTrace(input: number[], variant = 'insert', doubly = false, value = 42) {
  const nodes = input.map((data, i) => ({
    id: `N${i}`,
    data,
    next: i + 1 < input.length ? `N${i + 1}` : null,
    prev: doubly && i > 0 ? `N${i - 1}` : null,
  }));
  let head = nodes[0]?.id ?? null,
    tail = nodes.at(-1)?.id ?? null,
    size = nodes.length;
  const index = variant === 'prepend' ? 0 : variant === 'append' ? size : Math.floor(size / 2);
  const entries = [];
  const line = (key, text) => {
    entries.push({ key, text });
  };
  line('class', 'class Node:');
  line('init', '    def __init__(self, data):');
  line('data', '        self.data = data');
  line('next', '        self.next = None');
  if (doubly) line('prev', '        self.prev = None');
  line('gap', '');
  if (variant === 'reverse') {
    line('def', 'def reverse(head):');
    line('setup', '    old_head = head; previous, current = None, head');
    line('loop', '    while current is not None:');
    line('save', '        following = current.next');
    line('redirect', '        current.next = previous');
    if (doubly) line('back', '        current.prev = following');
    line('advance', '        previous, current = current, following');
    line('return', '    return previous, old_head  # new head and tail');
  } else if (variant === 'traverse') {
    line('def', 'def values(head):');
    line('setup', '    current = head');
    line('loop', '    while current is not None:');
    line('visit', '        yield current.data');
    line('advance', '        current = current.next');
    line('return', '    return');
  } else if (variant === 'search') {
    line('def', 'def find(head, target):');
    line('setup', '    current = head');
    line('loop', '    while current is not None:');
    line('match', '        if current.data == target:');
    line('found', '            return current');
    line('advance', '        current = current.next');
    line('missing', '    return None');
  } else {
    const remove = variant === 'remove';
    line('def', `def ${remove ? 'remove' : 'insert'}(head, tail, index${remove ? '' : ', value'}):`);
    line('check', '    if index < 0: raise IndexError(index)');
    line('setup', '    previous, current = None, head');
    line('loop', '    for _ in range(index):');
    line('guard', '        if current is None: raise IndexError(index)');
    line('advance', '        previous, current = current, current.next');
    if (remove) {
      line('empty', '    if current is None: raise IndexError(index)');
      line('save', '    following = current.next');
      line('front', '    if previous is None: head = following');
      line('redirect', '    else: previous.next = following');
      if (doubly) line('back', '    if following is not None: following.prev = previous');
      line('tail', '    if following is None: tail = previous');
      line('return', '    return head, tail');
    } else {
      line('create', '    node = Node(value)');
      line('suffix', '    node.next = current');
      if (doubly) line('back', '    node.prev = previous');
      line('front', '    if previous is None: head = node');
      line('redirect', '    else: previous.next = node');
      if (doubly) line('repair', '    if current is not None: current.prev = node');
      line('tail', '    if current is None: tail = node');
      line('return', '    return head, tail');
    }
  }
  const trace = recorder(
    entries.map((e) => e.text),
    `${doubly ? 'Doubly' : 'Singly'} linked list: ${variant}.`,
    'This trace uses node identity, not data equality. Nodes remain in allocation order on the diagram; only references change. Mutation functions return head/tail for the caller to store; traversal yields data. size and visits are visualization counters, not function locals.',
  );
  const find = (id) => nodes.find((n) => n.id === id);
  let visits = 0;
  const visited = [];
  const add = (key, title, why, active = [], extra = {}) =>
    trace.add({
      title,
      why,
      lines: [entries.findIndex((e) => e.key === key)],
      nodes: nodes.map((n) => ({ id: n.id, value: n.data, active: active.includes(n.id) })),
      links: nodes.flatMap((n) => [
        ...(n.next ? [{ from: n.id, to: n.next, label: 'next' }] : []),
        ...(doubly && n.prev ? [{ from: n.id, to: n.prev, label: 'prev' }] : []),
      ]),
      rows: [{ label: 'Visited values', values: visited }],
      variables: { head: head ?? 'None', tail: tail ?? 'None', size, visits, ...extra },
    });
  add(
    'def',
    'Start from the given chain',
    'Each next reference identifies another node, regardless of where it is allocated. Empty input starts with head and tail both None.',
  );
  if (variant === 'traverse') {
    let current = head;
    add('setup', 'current starts at head', 'The generator has not yielded any data yet.', current ? [current] : [], {
      current: current ?? 'None',
    });
    while (current) {
      visits++;
      visited.push(find(current).data);
      add(
        'visit',
        `Yield data from ${current}`,
        'Yield suspends here, preserving current. A later next(generator) resumes after this line.',
        [current],
        { current },
      );
      current = find(current).next;
      add('advance', 'Follow current.next', 'A None next ends the traversal.', current ? [current] : [], {
        current: current ?? 'None',
      });
    }
    add(
      'return',
      'Traversal is complete',
      'Every reachable node was visited once. A cycle would violate the terminating-list assumption.',
    );
  } else if (variant === 'search') {
    const target = 6;
    let current = head;
    add('setup', 'current starts at head', 'Search begins at the first reachable node.', current ? [current] : [], {
      current: current ?? 'None',
      target,
    });
    while (current) {
      add('loop', 'Check that current is not None', 'Only read data after confirming a node exists.', [current], {
        current,
        target,
      });
      visits++;
      visited.push(find(current).data);
      if (find(current).data === target) {
        add(
          'match',
          `Compare ${current}.data with target`,
          'This is the first matching node, so the search stops here.',
          [current],
          {
            current,
            target,
          },
        );
        add(
          'found',
          `Found ${target} at ${current}`,
          'Return the matching node without scanning the suffix.',
          [current],
          {
            current,
            target,
          },
        );
        return trace.finish();
      }
      add(
        'match',
        `Compare ${current}.data with target`,
        'No match; follow next to inspect the next node.',
        [current],
        {
          current,
          target,
        },
      );
      current = find(current).next;
      add(
        'advance',
        'Advance current',
        'Each link visit moves the search forward by one node.',
        current ? [current] : [],
        {
          current: current ?? 'None',
          target,
        },
      );
    }
    add('missing', `Target ${target} was not found`, 'Reaching None means every node was checked.', [], {
      current: 'None',
      target,
    });
  } else if (variant === 'reverse') {
    let previous = null,
      current = head;
    const oldHead = head;
    while (current) {
      visits++;
      const following = find(current).next;
      add(
        'save',
        `Save ${current}.next`,
        'Keep the unprocessed suffix reachable before overwriting the forward link.',
        [current],
        { previous: previous ?? 'None', current, following: following ?? 'None' },
      );
      find(current).next = previous;
      add(
        'redirect',
        `Reverse ${current}.next`,
        'The reversed prefix grows by one node. following still preserves the suffix.',
        [current],
        { previous: previous ?? 'None', current, following: following ?? 'None' },
      );
      if (doubly) {
        find(current).prev = following;
        add(
          'back',
          `Repair ${current}.prev`,
          'In the reversed chain, the old following node becomes this node’s predecessor.',
          [current],
          { following: following ?? 'None' },
        );
      }
      previous = current;
      current = following;
      add(
        'advance',
        'Advance both local references',
        'Do not advance by current.next after reversing it; use the saved following reference.',
        current ? [current] : [],
        { previous: previous ?? 'None', current: current ?? 'None' },
      );
    }
    head = previous;
    tail = oldHead;
    add(
      'return',
      'Store the new head and tail',
      'The old head is now the tail. In a doubly linked list, the new head.prev and tail.next are both None.',
    );
  } else {
    if (variant === 'remove' && size === 0) {
      add(
        'empty',
        'Reject removal from an empty list',
        'There is no node at index zero. This function raises IndexError instead of silently changing metadata.',
      );
      return trace.finish();
    }
    let previous = null,
      current = head;
    for (let i = 0; i < index; i++) {
      visits++;
      previous = current;
      current = find(current).next;
      add(
        'advance',
        `Walk to insertion/removal position ${i + 1}`,
        'Finding a position costs link visits. Rewiring afterward is separate constant work.',
        current ? [current] : [],
        { index, previous, current: current ?? 'None' },
      );
    }
    if (variant === 'remove') {
      const following = find(current).next;
      add('save', 'Save the successor', 'The saved reference identifies the suffix to preserve.', [current], {
        current,
        following: following ?? 'None',
      });
      if (previous === null) {
        head = following;
        add('front', 'Move head to the successor', 'Removing the head needs no predecessor node.', [current]);
      } else {
        find(previous).next = following;
        add('redirect', 'Bypass the removed node', 'The prefix now points directly to the successor.', [
          previous,
          current,
        ]);
      }
      if (doubly && following) {
        find(following).prev = previous;
        add('back', 'Repair the successor’s prev', 'Both directions must agree after removal.', [following]);
      }
      if (following === null) {
        tail = previous;
        add('tail', 'Update tail', 'Removing the last node moves tail to its predecessor, or None for a singleton.');
      }
      nodes.splice(
        nodes.findIndex((n) => n.id === current),
        1,
      );
      size--;
      add(
        'return',
        'Return updated head and tail',
        'The detached node is no longer part of the list. Stored size decreases after successful removal.',
      );
    } else {
      nodes.push({ id: 'X', data: value, next: null, prev: null });
      add(
        'create',
        'Allocate a new node X',
        'Allocation alone does not insert the node into the existing chain.',
        ['X'],
        { index, value },
      );
      find('X').next = current;
      add(
        'suffix',
        'Connect X.next to the suffix',
        'Preserve current before changing the link that used to reach it.',
        ['X'],
        { current: current ?? 'None' },
      );
      if (doubly) {
        find('X').prev = previous;
        add(
          'back',
          'Connect X.prev to the predecessor',
          'The new node’s backward link is initialized before repairing its neighbors.',
          ['X'],
          { previous: previous ?? 'None' },
        );
      }
      if (previous === null) {
        head = 'X';
        add('front', 'Set head to X', 'Prepending and insertion into an empty list update head.', ['X']);
      } else {
        find(previous).next = 'X';
        add(
          'redirect',
          'Connect the predecessor to X',
          'The prefix now includes the new node. All original nodes are still reachable.',
          [previous, 'X'],
        );
      }
      if (doubly && current) {
        find(current).prev = 'X';
        add(
          'repair',
          'Repair the successor’s prev',
          'A forward insertion is incomplete until the backward reference agrees.',
          [current, 'X'],
        );
      }
      if (current === null) {
        tail = 'X';
        add('tail', 'Set tail to X', 'Appending reaches None. Empty-list insertion sets both head and tail to X.', [
          'X',
        ]);
      }
      size++;
      add(
        'return',
        'Return updated head and tail',
        'The insertion location was found by traversal; only the final link changes are constant work.',
      );
    }
  }
  return trace.finish();
}
