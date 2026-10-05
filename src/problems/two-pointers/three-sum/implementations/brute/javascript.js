function threeSum(values) {
  const answers = new Map();
  for (let a = 0; a < values.length; a++) {
    for (let i = a + 1; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[a] + values[i] + values[j] === 0) {
          const triplet = [values[a], values[i], values[j]].sort((x, y) => x - y);
          // Compare values, not array identity.
          answers.set(triplet.join(','), triplet);
        }
      }
    }
  }
  return [...answers.values()];
}
