function twoSum(numbers, target) {
  for (let i = 0; i < numbers.length; i++) {
    const needed = target - numbers[i];
    let left = i + 1,
      right = numbers.length - 1;

    // Search only to the right: never reuse index i.
    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      if (numbers[middle] === needed) return [i, middle];
      if (numbers[middle] < needed) left = middle + 1;
      else right = middle - 1;
    }
  }
  return null;
}
