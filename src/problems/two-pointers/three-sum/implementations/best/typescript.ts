function threeSum(values: number[]): number[][] {
  const numbers = values.slice().sort((x, y) => x - y);
  const answers: number[][] = [];
  for (let a = 0; a < numbers.length - 2; a++) {
    if (a > 0 && numbers[a] === numbers[a - 1]) continue;
    if (numbers[a] > 0) break;
    let i = a + 1,
      j = numbers.length - 1;
    while (i < j) {
      const total = numbers[a] + numbers[i] + numbers[j];
      if (total < 0) i++;
      else if (total > 0) j--;
      else {
        answers.push([numbers[a], numbers[i], numbers[j]]);
        i++;
        j--;
        // Same endpoint values would repeat the same triplet.
        while (i < j && numbers[i] === numbers[i - 1]) i++;
        while (i < j && numbers[j] === numbers[j + 1]) j--;
      }
    }
  }
  return answers;
}
