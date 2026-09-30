function countingSort(values) {
  if (values.length === 0) return [];
  const smallest = Math.min(...values);
  const counts = Array(Math.max(...values) - smallest + 1).fill(0);
  for (const value of values) counts[value - smallest] += 1;
  return counts.flatMap((count, offset) => Array(count).fill(smallest + offset));
}

console.log(countingSort([4, 7, 8, 2, 9, 5, 6, 3, 1]));

