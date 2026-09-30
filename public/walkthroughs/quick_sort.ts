function quickSort(values: number[]): number[] {
  if (values.length < 2) return values.slice();
  const pivot = values[Math.floor(values.length / 2)];
  const smaller = values.filter((value) => value < pivot);
  const equal = values.filter((value) => value === pivot);
  const larger = values.filter((value) => value > pivot);
  return [...quickSort(smaller), ...equal, ...quickSort(larger)];
}

console.log(quickSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));

