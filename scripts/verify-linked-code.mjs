import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { linkedTrace } from '../src/structures/code-traces.ts';
const cases = [];
for (let n = 0; n <= 8; n++)
  for (const doubly of [false, true])
    for (const variant of ['insert', 'prepend', 'append', 'remove', 'reverse', 'traverse']) {
      const input = Array.from({ length: n }, (_, i) => i % 3),
        trace = linkedTrace(input, variant, doubly);
      const expected = [...input];
      if (variant === 'reverse') expected.reverse();
      if (['insert', 'prepend', 'append'].includes(variant))
        expected.splice(variant === 'prepend' ? 0 : variant === 'append' ? n : Math.floor(n / 2), 0, 42);
      if (variant === 'remove' && n) expected.splice(Math.floor(n / 2), 1);
      cases.push({
        code: trace.code.join('\n'),
        input,
        expected,
        variant,
        doubly,
        index: variant === 'prepend' ? 0 : variant === 'append' ? n : Math.floor(n / 2),
      });
    }
const program = `import sys,json\nfor c in json.load(sys.stdin):\n ns={}\n exec(c['code'],ns)\n Node=ns['Node']; nodes=[Node(v) for v in c['input']]\n for i,node in enumerate(nodes):\n  node.next=nodes[i+1] if i+1<len(nodes) else None\n  if c['doubly']: node.prev=nodes[i-1] if i else None\n head=nodes[0] if nodes else None;tail=nodes[-1] if nodes else None\n if c['variant']=='traverse':\n  assert list(ns['values'](head))==c['expected']\n  continue\n if c['variant']=='remove' and not nodes:\n  try: ns['remove'](head,tail,0)\n  except IndexError: continue\n  raise AssertionError('empty removal must fail')\n if c['variant']=='reverse': head,tail=ns['reverse'](head)\n elif c['variant']=='remove': head,tail=ns['remove'](head,tail,c['index'])\n else: head,tail=ns['insert'](head,tail,c['index'],42)\n current=head;previous=None;seen=set();data=[]\n while current is not None:\n  assert id(current) not in seen\n  seen.add(id(current));data.append(current.data)\n  if c['doubly']: assert current.prev is previous\n  previous=current;current=current.next\n assert previous is tail\n assert data==c['expected'],c\nprint('Displayed linked-list Python: 108 empty/singleton/duplicate-data operations pass with forward/backward invariants.')\n`;
const result = spawnSync(process.env.PYTHON ?? 'python', ['-c', program], {
  input: JSON.stringify(cases),
  encoding: 'utf8',
});
assert.equal(result.status, 0, result.stderr);
console.log(result.stdout.trim());
