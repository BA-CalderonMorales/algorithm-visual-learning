import { recorder } from '../shared/trace/model.ts';
export function arrayTrace(input: number[]) {
  const a = [...input],
    index = Math.floor(a.length / 2),
    value = 42;
  const trace = recorder(
    [
      'def insert_at(values, index, value):',
      '    if not 0 <= index <= len(values): raise IndexError(index)',
      '    a = list(values)',
      '    a.append(None)  # reserve one logical slot',
      '    for j in range(len(a) - 1, index, -1):',
      '        a[j] = a[j - 1]',
      '    a[index] = value',
      '    return a',
    ],
    'Array insertion: indices move data.',
    'This explicit teaching implementation returns a copy. The middle insertion index is floor(n/2), and the inserted value is 42. Python’s built-in list.insert performs the shifting internally; allocated capacity is an implementation detail not shown here.',
  );
  let shifts = 0;
  const add = (title, why, lines, active = [], extra = {}) =>
    trace.add({
      title,
      why,
      lines,
      rows: [
        {
          label: 'Contiguous logical slots — labels below are indices',
          values: a.map((v) => (v === null ? 'None' : v)),
          active,
        },
      ],
      variables: { index, value, shifts, 'logical length': a.length, ...extra },
    });
  add(
    'Copy the input',
    'Values occupy consecutive logical indices. Finding index does not require following links.',
    [2],
  );
  a.push(null);
  add(
    'Reserve a slot at the end',
    'Appending a placeholder creates room; it does not yet insert 42 at the chosen index.',
    [3],
    [a.length - 1],
  );
  for (let j = a.length - 1; j > index; j--) {
    a[j] = a[j - 1];
    shifts++;
    add(
      `Shift index ${j - 1} to ${j}`,
      'Move right-to-left so a value is copied before its old slot is overwritten.',
      [5],
      [j - 1, j],
      { j },
    );
  }
  a[index] = value;
  add('Fill the opened slot', 'The suffix has moved right by one; the prefix keeps its indices.', [6], [index]);
  add(
    'Return the new list',
    'A middle insertion needs n−index shifts plus this implementation’s input copy. It takes O(n) time and O(n) auxiliary space.',
    [7],
  );
  return trace.finish();
}
