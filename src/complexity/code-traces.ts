import { recorder } from '../shared/trace/model.ts';
export function countTrace(n: number, variant = 'triangular') {
  const halving = variant === 'halving',
    linear = variant === 'linear';
  const code = halving
    ? [
        'def count_work(n):',
        '    work = 0',
        '    remaining = n',
        '    while remaining > 1:',
        '        remaining //= 2',
        '        work += 1',
        '    return work',
      ]
    : linear
      ? ['def count_work(n):', '    work = 0', '    for i in range(n):', '        work += 1', '    return work']
      : [
          'def count_work(n):',
          '    work = 0',
          '    for i in range(n):',
          '        for j in range(i + 1, n):',
          '            work += 1',
          '    return work',
        ];
  const trace = recorder(
    code,
    halving
      ? 'Halving: count the boundary moves.'
      : linear
        ? 'One loop: count visits.'
        : 'Dependent loops: count executed pairs.',
    'The counter measures the marked operation exactly. Loop conditions and other assignments are not included. Change n to distinguish a measured count from its growth class.',
  );
  let work = 0;
  const pairs = [];
  const total = halving ? Math.floor(Math.log2(Math.max(1, n))) : linear ? n : (n * (n - 1)) / 2;
  const add = (title, why, lines, variables, active = []) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Input indices', values: Array.from({ length: n }, (_, i) => i), active },
        { label: halving ? 'Remaining sizes' : 'Completed operations', values: pairs.slice(-8) },
      ],
      variables: { n, work, 'final count': total, ...variables },
    });
  add(
    'Initialize the operation counter',
    'work starts at zero; initializing it is not the operation being measured.',
    [1],
    {},
  );
  if (halving) {
    let remaining = n;
    pairs.push(remaining);
    add('Store remaining size', 'The while loop continues only while remaining exceeds one.', [2], { remaining });
    while (remaining > 1) {
      remaining = Math.floor(remaining / 2);
      add('Halve the remaining size', 'A constant amount of work removes roughly half the candidates.', [4], {
        remaining,
      });
      work++;
      pairs.push(remaining);
      add(
        'Count one halving operation',
        'Count how often the marked line executes, rather than counting how many loop headers are written.',
        [5],
        { remaining },
      );
    }
  } else {
    for (let i = 0; i < n; i++) {
      add(
        `Outer position i=${i}`,
        'This loop visits each starting position. Its inner range, if present, depends on i.',
        [2],
        { i },
        [i],
      );
      if (linear) {
        work++;
        pairs.push(i);
        add(`Count visit ${work}`, 'One marked operation per index gives exactly n operations.', [3], { i }, [i]);
      } else
        for (let j = i + 1; j < n; j++) {
          work++;
          pairs.push(`(${i},${j})`);
          add(
            `Count pair (${i},${j})`,
            'Every pair with i < j is visited once. A later i has a shorter inner range.',
            [3, 4],
            { i, j },
            [i, j],
          );
        }
    }
  }
  add(
    'Return the exact count',
    halving
      ? 'Repeated floor-halving takes floor(log₂n) iterations for positive n.'
      : linear
        ? 'The exact count n grows as Θ(n).'
        : 'The exact count n(n−1)/2 grows as Θ(n²). Constants and lower-order terms do not change the growth class.',
    [code.length - 1],
    {},
  );
  return trace.finish();
}
export function recurrenceTrace(n: number, variant = 'two-half') {
  const subtract = variant === 'subtract',
    a = variant === 'three-half' ? 3 : variant === 'one-half' || subtract ? 1 : 2;
  const code = [
    'def measured_work(n):',
    '    if n <= 1:',
    '        return 1',
    '    local = 0',
    '    for _ in range(n):',
    '        local += 1',
    '    total = local',
    '    for _ in range(A):',
    `        total += measured_work(${subtract ? 'n - 1' : 'n // 2'})`,
    '    return total',
    '',
    `A = ${a}`,
  ];
  const trace = recorder(
    code,
    `Build T(n) from actual calls: ${subtract ? 'T(n−1)' : 'A·T(n/2)'} + n.`,
    `A = ${a}. This is a work-count model, not an array-sorting implementation. Floor division is explicit. The base call contributes one unit; a larger call actually executes n loop increments outside its child calls. The return value counts marked work; it is not elapsed time.`,
  );
  const stack = [];
  let calls = 0,
    localUnits = 0;
  const levels = new Map();
  const add = (title, why, lines, extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        { label: 'Active call stack', values: stack.map((s) => `n=${s}`) },
        ...Array.from(levels.entries()).map(([depth, info]) => ({
          label: `Level ${depth}`,
          values: [`${info.calls} calls visited`, `${info.work} local units`],
        })),
      ],
      variables: { A: a, 'calls visited': calls, 'local units counted': localUnits, ...extra },
    });
  function solve(size, depth) {
    calls++;
    stack.push(size);
    const info = levels.get(depth) ?? { calls: 0, work: 0 };
    info.calls++;
    levels.set(depth, info);
    add(
      `Enter call with n=${size}`,
      'A written recursive-call expression can execute more than once inside a loop. Count actual invocations.',
      [0, 1],
      { n: size, depth },
    );
    if (size <= 1) {
      localUnits++;
      info.work++;
      add('Return the base unit', 'No child call executes here.', [2], { n: size, depth, 'return value': 1 });
      stack.pop();
      return 1;
    }
    localUnits += size;
    info.work += size;
    let total = size;
    add(
      `Count ${size} units of local work`,
      'This work happens in the current call, outside all its recursive children.',
      [3, 4, 5, 6],
      { n: size, depth, total },
    );
    for (let branch = 0; branch < a; branch++) {
      add(
        `Make child call ${branch + 1} of ${a}`,
        subtract
          ? 'Size decreases by one, giving linear recursion depth.'
          : 'Every child has floor(n/2) size. Sibling calls contribute separate work.',
        [7, 8],
        { n: size, depth, branch, total },
      );
      total += solve(subtract ? size - 1 : Math.floor(size / 2), depth + 1);
      add(
        'Combine the returned child work',
        'A child returns before the parent resumes. Parent locals remain on its stack frame.',
        [8],
        { n: size, depth, branch, total },
      );
    }
    add(
      'Return this subtree’s total work',
      'This return combines the current local contribution with every executed child.',
      [9],
      { n: size, depth, total },
    );
    stack.pop();
    return total;
  }
  const total = solve(n, 0);
  const result = subtract
    ? 'Θ(n²): sum the decreasing local contributions; the fixed-fraction Master theorem does not apply.'
    : a === 1
      ? 'Θ(n): local contributions form a decreasing geometric series.'
      : a === 2
        ? 'Θ(n log n): each level has roughly n local units and logarithmic depth.'
        : 'Θ(n^(log₂3)): recursive leaves grow faster than the linear root contribution.';
  add('Extract the recurrence and growth class', result, [9], {
    'exact model total': total,
    recurrence: subtract ? 'T(n−1)+n' : `${a}T(n/2)+n`,
  });
  return trace.finish();
}
export function spaceTrace(n: number) {
  const trace = recorder(
    [
      'def descend(n):',
      '    if n == 0:',
      '        return',
      '    saved = n',
      '    descend(n - 1)',
      '    use(saved)  # resume after the child returns',
      '    return',
      '',
      'def use(value):',
      '    pass  # illustrative constant work',
    ],
    'Memory: live frames versus total calls.',
    'use(saved) denotes constant work. Counters track descend calls and frames only; the constant-work use helper is excluded from the instrumentation. Freed child frames do not remain live.',
  );
  const stack = [];
  let calls = 0,
    peak = 0;
  const add = (title, why, lines) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        {
          label: 'Live stack — oldest frame on the left',
          values: stack.map((v) => `n=${v}`),
          active: stack.length ? [stack.length - 1] : [],
        },
      ],
      variables: { 'live frames': stack.length, 'peak frames': peak, 'total calls': calls },
    });
  function descend(k) {
    stack.push(k);
    calls++;
    peak = Math.max(peak, stack.length);
    add(`Allocate a frame for n=${k}`, 'A parent frame remains live while its child runs.', [0, 1]);
    if (k > 0) {
      add(
        'Save a local, then call the child',
        'Each frame has its own saved value. These locals coexist at the deepest point.',
        [3, 4],
      );
      descend(k - 1);
      add(
        `Resume parent n=${k}`,
        'The child has returned, so its frame is gone. Only the parent and older callers remain.',
        [5],
      );
    } else add('Base case returns', 'The deepest call is complete; unwinding begins.', [2]);
    stack.pop();
    add(
      'Release this frame',
      'Total calls stay counted, but live memory decreases. Peak memory records the maximum, not the sum over time.',
      [k === 0 ? 2 : 6],
    );
  }
  descend(n);
  return trace.finish();
}
