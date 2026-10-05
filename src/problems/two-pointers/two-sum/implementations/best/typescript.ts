function twoSum(numbers: number[], target: number): [number, number] | null {
  let i = 0,
    j = numbers.length - 1;
  while (i < j) {
    const total = numbers[i] + numbers[j];
    if (total === target) return [i, j];
    // Sorted order makes it safe to discard one endpoint.
    if (total < target) i++;
    else j--;
  }
  return null;
}
