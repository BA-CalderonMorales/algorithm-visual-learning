function bubbleSort(values) {
  const a = values.slice();
  for (let end = a.length - 1; end > 0; end--) {
    let changed = false;
    for (let j = 0; j < end; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return a;
}
