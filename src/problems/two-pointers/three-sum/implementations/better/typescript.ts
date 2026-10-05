function threeSum(values: number[]): number[][] {
  const answers = new Map<string, number[]>();
  for (let a = 0; a < values.length; a++) {
    const seen = new Set<number>();
    for (let j = a + 1; j < values.length; j++) {
      const needed = -values[a] - values[j];
      if (seen.has(needed)) {
        const triplet = [values[a], needed, values[j]].sort((x, y) => x - y);
        answers.set(triplet.join(','), triplet);
      }
      // Add after checking, so the same position is never reused.
      seen.add(values[j]);
    }
  }
  return [...answers.values()];
}
