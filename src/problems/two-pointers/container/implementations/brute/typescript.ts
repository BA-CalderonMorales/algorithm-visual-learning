function maxArea(heights: number[]): number {
  let best = 0;
  for (let i = 0; i < heights.length; i++) {
    for (let j = i + 1; j < heights.length; j++) {
      const area = (j - i) * Math.min(heights[i], heights[j]);
      best = Math.max(best, area);
    }
  }
  return best;
}
