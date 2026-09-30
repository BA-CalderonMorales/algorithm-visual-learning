function timSort(values) {
  const runSize = 4;
  let runs = [];
  for (let start = 0; start < values.length; start += runSize) {
    const run = values.slice(start, start + runSize);
    for (let index = 1; index < run.length; index += 1) {
      const key = run[index];
      let position = index;
      while (position > 0 && run[position - 1] > key) {
        run[position] = run[position - 1];
        position -= 1;
      }
      run[position] = key;
    }
    runs.push(run);
  }
  while (runs.length > 1) {
    const mergedRuns = [];
    for (let index = 0; index < runs.length; index += 2) {
      if (!runs[index + 1]) mergedRuns.push(runs[index]);
      else mergedRuns.push(merge(runs[index], runs[index + 1]));
    }
    runs = mergedRuns;
  }
  return runs[0] || [];
}
function merge(left, right) {
  const merged = [];
  while (left.length && right.length) merged.push(left[0] <= right[0] ? left.shift() : right.shift());
  return [...merged, ...left, ...right];
}

console.log(timSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));

