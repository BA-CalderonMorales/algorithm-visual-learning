function insertionSort(values) {
  const sorted = values.slice();
  for (let index = 1; index < sorted.length; index += 1) {
    const key = sorted[index];
    let position = index;
    while (position > 0 && sorted[position - 1] > key) {
      sorted[position] = sorted[position - 1];
      position -= 1;
    }
    sorted[position] = key;
  }
  return sorted;
}

console.log(insertionSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));
