import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { linkedTrace } from '../src/structures/code-traces.ts';

const cases = [];
for (let n = 0; n <= 8; n++) {
  for (const doubly of [false, true]) {
    for (const variant of ['insert', 'prepend', 'append', 'remove', 'reverse', 'traverse', 'search']) {
      const input = Array.from({ length: n }, (_, i) => (i === Math.floor(n / 2) && n ? 6 : i % 3));
      const trace = linkedTrace(input, variant, doubly);
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
  }
}

const program = `import sys,json
for c in json.load(sys.stdin):
 ns={}
 exec(c['code'],ns)
 Node=ns['Node']; nodes=[Node(v) for v in c['input']]
 for i,node in enumerate(nodes):
  node.next=nodes[i+1] if i+1<len(nodes) else None
  if c['doubly']: node.prev=nodes[i-1] if i else None
 head=nodes[0] if nodes else None;tail=nodes[-1] if nodes else None
 if c['variant']=='traverse':
  assert list(ns['values'](head))==c['expected']
  continue
 if c['variant']=='search':
  result=ns['find'](head,6)
  matches=[node for node in nodes if node.data==6]
  assert result is (matches[0] if matches else None), c
  continue
 if c['variant']=='remove' and not nodes:
  try: ns['remove'](head,tail,0)
  except IndexError: continue
  raise AssertionError('empty removal must fail')
 if c['variant']=='reverse': head,tail=ns['reverse'](head)
 elif c['variant']=='remove': head,tail=ns['remove'](head,tail,c['index'])
 else: head,tail=ns['insert'](head,tail,c['index'],42)
 current=head;previous=None;seen=set();data=[]
 while current is not None:
  assert id(current) not in seen
  seen.add(id(current));data.append(current.data)
  if c['doubly']: assert current.prev is previous
  previous=current;current=current.next
 assert previous is tail
 assert data==c['expected'],c
print('Displayed linked-list Python: 126 empty/singleton/duplicate-data operations, search paths and forward/backward invariants pass.')
`;
const result = spawnSync(process.env.PYTHON ?? 'python', ['-c', program], {
  input: JSON.stringify(cases),
  encoding: 'utf8',
});
assert.equal(result.status, 0, result.stderr);
console.log(result.stdout.trim());
