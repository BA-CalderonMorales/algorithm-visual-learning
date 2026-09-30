function mergeSort(values) {
  if (values.length < 2) return values.slice();
  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...merged, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));

