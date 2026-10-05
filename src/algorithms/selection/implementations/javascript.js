function selectionSort(values) {
  const sorted = values.slice();
  for (let start = 0; start < sorted.length; start += 1) {
    let smallest = start;
    for (let scan = start + 1; scan < sorted.length; scan += 1) {
      if (sorted[scan] < sorted[smallest]) smallest = scan;
    }
    [sorted[start], sorted[smallest]] = [sorted[smallest], sorted[start]];
  }
  return sorted;
}

console.log(selectionSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));
