function shellSort(values: number[]): number[] {
  const sorted = values.slice();
  for (let gap = Math.floor(sorted.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let index = gap; index < sorted.length; index += 1) {
      const key: number = sorted[index];
      let position: number = index;
      while (position >= gap && sorted[position - gap] > key) {
        sorted[position] = sorted[position - gap];
        position -= gap;
      }
      sorted[position] = key;
    }
  }
  return sorted;
}

console.log(shellSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));

